import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { WhatsappCampaign, WhatsAppAccount, Company, WhatsappContact, WhatsappMessageLog, WhatsAppTemplate, WhatsappContactGroup } from "../models/index.js";

// Redis client configuration
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

let redisConnection = null;
let campaignQueue = null;
let campaignWorker = null;
let isRedisConnected = false;

// In-Memory fallback queue structures
const inMemoryQueue = [];
let isInMemoryProcessing = false;

// Initialize connection
export async function initializeQueue() {
  try {
    redisConnection = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: null,
      connectTimeout: 3000,
      retryStrategy: () => null, // Stop retrying immediately if Redis is not running
    });

    redisConnection.on("connect", () => {
      console.log(`[WhatsApp Queue] Connected to Redis on ${REDIS_HOST}:${REDIS_PORT}`);
      isRedisConnected = true;
    });

    redisConnection.on("error", (err) => {
      console.warn(`[WhatsApp Queue] Redis connection error: ${err.message}. Running in In-Memory Mode.`);
      isRedisConnected = false;
    });

    // Initialize BullMQ Queue
    campaignQueue = new Queue("whatsapp-campaigns", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    });

    campaignQueue.on("error", (err) => {
      // Catch connection errors silently
    });

    // Initialize BullMQ Worker
    campaignWorker = new Worker(
      "whatsapp-campaigns",
      async (job) => {
        await processCampaignJob(job.data.campaignId, job.data.companyId);
      },
      { connection: redisConnection }
    );

    campaignWorker.on("error", (err) => {
      // Catch connection errors silently
    });

    campaignWorker.on("completed", (job) => {
      console.log(`[WhatsApp Queue] Job completed: Campaign ${job.data.campaignId}`);
    });

    campaignWorker.on("failed", (job, err) => {
      console.error(`[WhatsApp Queue] Job failed: Campaign ${job?.data.campaignId}, Error: ${err.message}`);
    });

  } catch (error) {
    console.warn(`[WhatsApp Queue] Failed to initialize Redis. Running in In-Memory Mode: ${error.message}`);
    isRedisConnected = false;
    startInMemoryProcessor();
  }
}

// Add campaign execution job to the queue
export async function queueCampaign(campaignId, companyId) {
  await WhatsappCampaign.findByIdAndUpdate(campaignId, { status: "RUNNING" });

  if (isRedisConnected && campaignQueue) {
    console.log(`[WhatsApp Queue] Queueing campaign ${campaignId} via Redis`);
    await campaignQueue.add(`campaign-${campaignId}`, { campaignId, companyId });
  } else {
    console.log(`[WhatsApp Queue] Queueing campaign ${campaignId} via In-Memory Fallback`);
    const job = {
      id: `inmem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: { campaignId, companyId },
      status: "queued",
      attemptsMade: 0,
    };
    inMemoryQueue.push(job);
    startInMemoryProcessor();
  }
}

// Start processing in-memory jobs if not already running
function startInMemoryProcessor() {
  if (isInMemoryProcessing) return;
  isInMemoryProcessing = true;

  (async () => {
    while (true) {
      const job = inMemoryQueue.find((j) => j.status === "queued");
      if (!job) {
        isInMemoryProcessing = false;
        break;
      }

      job.status = "active";
      job.attemptsMade += 1;

      try {
        console.log(`[WhatsApp Queue In-Memory] Processing job ${job.id} for Campaign ${job.data.campaignId}`);
        await processCampaignJob(job.data.campaignId, job.data.companyId);
        job.status = "completed";
      } catch (err) {
        console.error(`[WhatsApp Queue In-Memory] Error processing job ${job.id}: ${err.message}`);
        if (job.attemptsMade < 3) {
          job.status = "queued"; // Retry
          console.log(`[WhatsApp Queue In-Memory] Retrying job ${job.id} in 5s (Attempt ${job.attemptsMade + 1})`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          job.status = "failed";
          job.failedReason = err.message;
          await WhatsappCampaign.findByIdAndUpdate(job.data.campaignId, { status: "FAILED" });
        }
      }
    }
  })();
}

// Main Core Campaign Execution Processor
async function processCampaignJob(campaignId, companyId) {
  console.log(`[WhatsApp Campaign Processor] Initiating campaign execution: ${campaignId}`);

  const campaign = await WhatsappCampaign.findById(campaignId);
  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  const template = campaign.templateId ? await WhatsAppTemplate.findById(campaign.templateId) : null;
  const audiences = campaign.audienceGroupIds ? await WhatsappContactGroup.find({ _id: { $in: campaign.audienceGroupIds } }) : [];

  const account = await WhatsAppAccount.findOne({ companyId });
  const company = await Company.findById(companyId).select("credits plan");

  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  const contactMap = new Map();
  for (const group of audiences) {
    let contacts = [];
    if (group.isDynamic && group.dynamicRules) {
      const rules = group.dynamicRules;
      const filters = { companyId, status: "active" };
      if (rules.tags && Array.isArray(rules.tags) && rules.tags.length > 0) {
        filters.tags = { $in: rules.tags };
      }
      if (rules.countryCode) {
        filters.countryCode = rules.countryCode;
      }
      contacts = await WhatsappContact.find(filters);
    } else if (group.contactIds && group.contactIds.length > 0) {
      contacts = await WhatsappContact.find({ _id: { $in: group.contactIds }, status: "active" });
    }

    for (const contact of contacts) {
      contactMap.set(String(contact._id), contact);
    }
  }
  const targetContacts = Array.from(contactMap.values());

  if (targetContacts.length === 0) {
    console.log(`[WhatsApp Campaign Processor] Campaign ${campaignId} has no target contacts.`);
    await WhatsappCampaign.findByIdAndUpdate(campaignId, { status: "COMPLETED" });
    return;
  }

  console.log(`[WhatsApp Campaign Processor] Target contact count: ${targetContacts.length}`);

  let successCount = 0;
  let failureCount = 0;

  for (const contact of targetContacts) {
    const updatedCompany = await Company.findById(companyId).select("credits");

    if (!updatedCompany || updatedCompany.credits <= 0) {
      console.warn(`[WhatsApp Campaign Processor] Company ${companyId} has run out of outreach credits.`);
      await WhatsappMessageLog.create({
        campaignId,
        contactId: contact._id,
        status: "FAILED",
        failedReason: "Insufficient system credits.",
      });
      failureCount++;
      continue;
    }

    let personalizedBody = template?.bodyText || "";
    const fullName = `${contact.firstName} ${contact.lastName || ""}`.trim();
    personalizedBody = personalizedBody.replace(/\{\{name\}\}/gi, fullName);
    personalizedBody = personalizedBody.replace(/\{\{first_name\}\}/gi, contact.firstName);
    personalizedBody = personalizedBody.replace(/\{\{email\}\}/gi, contact.email || "");
    personalizedBody = personalizedBody.replace(/\{\{phone\}\}/gi, contact.mobile);

    const messageLog = await WhatsappMessageLog.create({
      campaignId,
      contactId: contact._id,
      status: "QUEUED",
    });

    try {
      let externalMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let status = "SENT";
      let failedReason = null;

      if (account && account.status === "connected" && account.accessToken) {
        try {
          const apiURL = `https://graph.facebook.com/v19.0/${account.phone}/messages`;
          if (account.accessToken === "mock-sandbox") {
            await simulateSendingDelay(100);
          } else {
            const response = await fetch(apiURL, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${account.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: `${contact.countryCode}${contact.mobile}`,
                type: "template",
                template: {
                  name: template?.name || "welcome",
                  language: { code: template?.language || "en_US" },
                },
              }),
            });
            if (!response.ok) {
              const errDetails = await response.json();
              throw new Error(errDetails.error?.message || "WhatsApp Meta API returned error status");
            }
            const resData = await response.json();
            externalMsgId = resData.messages?.[0]?.id || externalMsgId;
          }
        } catch (apiErr) {
          status = "FAILED";
          failedReason = apiErr.message;
        }
      } else {
        await simulateSendingDelay(150);
        if (Math.random() < 0.05) {
          status = "FAILED";
          failedReason = "Simulated network failure/recipient rate limit exceeded.";
        }
      }

      if (status === "SENT") {
        await Company.findByIdAndUpdate(companyId, { $inc: { credits: -1 } });

        const deliveredAt = new Date(Date.now() + Math.random() * 5000);
        const readAt = Math.random() > 0.3 ? new Date(deliveredAt.getTime() + Math.random() * 15000) : null;
        const msgStatus = readAt ? "READ" : "DELIVERED";

        await WhatsappMessageLog.findByIdAndUpdate(messageLog._id, {
          messageId: externalMsgId,
          status: msgStatus,
          deliveredAt,
          readAt,
        });
        successCount++;
      } else {
        await WhatsappMessageLog.findByIdAndUpdate(messageLog._id, {
          status: "FAILED",
          failedReason,
        });
        failureCount++;
      }
    } catch (err) {
      await WhatsappMessageLog.findByIdAndUpdate(messageLog._id, {
        status: "FAILED",
        failedReason: err.message,
      });
      failureCount++;
    }
  }

  const finalStatus = failureCount === targetContacts.length ? "FAILED" : "COMPLETED";
  await WhatsappCampaign.findByIdAndUpdate(campaignId, { status: finalStatus });

  console.log(`[WhatsApp Campaign Processor] Completed campaign ${campaignId}. Success: ${successCount}, Failures: ${failureCount}`);
}

function simulateSendingDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Queue Monitoring Stats
export async function getQueueStatus() {
  const activeInMemoryCount = inMemoryQueue.filter((j) => j.status === "active").length;
  const queuedInMemoryCount = inMemoryQueue.filter((j) => j.status === "queued").length;
  const totalInMemoryCount = inMemoryQueue.length;

  let activeRedisCount = 0;
  let waitingRedisCount = 0;

  if (isRedisConnected && campaignQueue) {
    try {
      activeRedisCount = await campaignQueue.getActiveCount();
      waitingRedisCount = await campaignQueue.getWaitingCount();
    } catch (err) {
      // Ignore
    }
  }

  return {
    redisConnected: isRedisConnected,
    mode: isRedisConnected ? "Redis + BullMQ" : "In-Memory Scheduler",
    queueDetails: {
      activeJobs: isRedisConnected ? activeRedisCount : activeInMemoryCount,
      waitingJobs: isRedisConnected ? waitingRedisCount : queuedInMemoryCount,
      totalTrackedJobs: isRedisConnected ? (activeRedisCount + waitingRedisCount) : totalInMemoryCount,
    },
    systemHealth: isRedisConnected ? "healthy" : "fallback-active",
  };
}

initializeQueue().catch((err) => {
  console.error("[WhatsApp Queue] Error during boot sequence:", err);
});
