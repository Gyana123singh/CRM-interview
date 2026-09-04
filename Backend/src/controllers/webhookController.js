import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  WhatsAppAccount,
  Company,
  Lead,
  ChatThread,
  Message,
  KnowledgeBase,
  User,
  AgentProfile,
  Invoice,
  Subscription,
  AuditLog
} from "../models/index.js";
import { broadcastToCompany } from "../utils/sse.js";

// GET /webhooks/whatsapp (Meta Webhook Verification Handshake)
export async function verifyWhatsappWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "my_secure_verify_token_123";

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WhatsApp Webhook verified successfully with Meta!");
      return res.status(200).send(challenge);
    } else {
      console.warn("WhatsApp Webhook verification failed: Token mismatch.");
      return res.status(403).send("Forbidden: Verification token mismatch.");
    }
  }
  return res.status(400).send("Bad Request: Missing hub.mode or hub.verify_token query parameters.");
}

// POST /webhooks/whatsapp
export async function receiveWhatsappMessage(req, res) {
  let phone = req.body.phone;
  let text = req.body.text;
  let companyId = req.body.companyId;
  let isMetaPayload = false;

  if (req.body.object === "whatsapp_business_account") {
    try {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        isMetaPayload = true;
        phone = message.from;
        text = message.text?.body || "";
        
        const displayPhone = value?.metadata?.display_phone_number;
        if (displayPhone) {
          const cleanDisplay = displayPhone.replace(/\D/g, "");
          
          const waAccounts = await WhatsAppAccount.find({ status: "connected" });
          
          const matchingAccount = waAccounts.find(a => {
            const cleanAccountPhone = a.phone.replace(/\D/g, "");
            return cleanAccountPhone === cleanDisplay || a.phone === displayPhone;
          });

          if (matchingAccount) {
            companyId = matchingAccount.companyId;
          } else {
            const companies = await Company.find({ whatsappConnected: true });
            
            const matchingCompany = companies.find(c => {
              const cleanCompanyPhone = c.whatsappPhone ? c.whatsappPhone.replace(/\D/g, "") : "";
              return cleanCompanyPhone === cleanDisplay || c.whatsappPhone === displayPhone;
            });

            if (matchingCompany) {
              companyId = matchingCompany._id;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error parsing Meta webhook payload:", err);
    }
  }

  if (!phone || !text || !companyId) {
    if (isMetaPayload) {
      console.warn(`Meta webhook received but could not map to workspace. Phone: ${phone}, Text: ${text}, Company: ${companyId}`);
      return res.status(200).send("EVENT_RECEIVED_BUT_UNMAPPED");
    }
    return res.status(400).json({ error: "Missing required parameters: phone, text, and companyId" });
  }

  try {
    let lead = await Lead.findOne({ companyId, phone });

    if (!lead) {
      lead = await Lead.create({
        companyId,
        name: `WhatsApp Lead ${phone.slice(-4)}`,
        phone,
        source: "WhatsApp",
        status: "New",
        serviceInterest: "WhatsApp Conversation Inbound"
      });
    }

    let thread = await ChatThread.findOne({ leadId: lead._id });

    if (!thread) {
      thread = await ChatThread.create({
        leadId: lead._id,
        aiAutoReply: true,
        status: "active"
      });
    }

    const customerMsg = await Message.create({
      threadId: thread._id,
      sender: "customer",
      text,
      channel: "WhatsApp"
    });

    await ChatThread.findByIdAndUpdate(thread._id, { updatedAt: new Date() });

    let botReplyText = "";
    if (thread.aiAutoReply) {
      const company = await Company.findById(companyId).select("botPersona botTemperature botAutoPilot");

      if (company && company.botAutoPilot) {
        const faqs = await KnowledgeBase.find({ companyId, category: { $ne: "document" } });
        const contextString = faqs.map(f => `Q: ${f.title}\nA: ${f.content}`).join("\n\n");

        const systemInstructions = `
          ${company.botPersona}
          
          Here is the official knowledge base context:
          ${contextString}
          
          Answer the user's message using only the context above. If you do not know the answer, politely ask them for contact details so a human representative can reach out.
        `;

        try {
          const geminiApiKey = process.env.GEMINI_API_KEY;
          if (geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY_HERE") {
            const ai = new GoogleGenerativeAI(geminiApiKey);
            const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

            const result = await model.generateContent({
              contents: [{ role: "user", parts: [{ text }] }],
              generationConfig: {
                temperature: company.botTemperature ?? 0.5,
              },
              systemInstruction: systemInstructions
            });

            botReplyText = result.response.text();
          } else {
            botReplyText = `[Simulated Gemini Reply] Thank you for your inquiry about "${text}". We have ready-to-move flats in Patia. What is your budget?`;
          }
        } catch (err) {
          botReplyText = `[Simulated Gemini Reply] Thank you for your message. An agent will follow up with you shortly.`;
        }

        const botMsg = await Message.create({
          threadId: thread._id,
          sender: "bot",
          text: botReplyText,
          aiResponse: botReplyText,
          channel: "WhatsApp"
        });

        try {
          broadcastToCompany(companyId, "message_created", {
            leadId: lead._id,
            id: botMsg._id,
            sender: "bot",
            text: botMsg.text,
            timestamp: botMsg.timestamp.toISOString(),
            channel: botMsg.channel
          });
        } catch (err) {}
      }
    }

    try {
      broadcastToCompany(companyId, "message_created", {
        leadId: lead._id,
        id: customerMsg._id,
        sender: "customer",
        text: customerMsg.text,
        timestamp: customerMsg.timestamp.toISOString(),
        channel: customerMsg.channel
      });
    } catch (err) {}

    return res.status(200).json({
      status: "success",
      customerMessage: text,
      botReplied: botReplyText ? true : false,
      botReply: botReplyText || undefined
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /webhooks/facebook-leads
export async function receiveFacebookLead(req, res) {
  const { name, phone, email, location, serviceInterest, companyId } = req.body;
  if (!name || !phone || !companyId) {
    return res.status(400).json({ error: "Missing required parameters: name, phone, and companyId" });
  }

  try {
    const lead = await Lead.create({
      companyId,
      name,
      phone,
      email,
      location,
      serviceInterest: serviceInterest || "Meta Ads Inbound Campaign Lead",
      source: "Meta Ads",
      status: "New"
    });

    await ChatThread.create({
      leadId: lead._id,
      aiAutoReply: true,
      status: "active"
    });

    const activeUsers = await User.find({ companyId, role: "team" });

    let assignedAgentId = null;
    if (activeUsers.length > 0) {
      assignedAgentId = activeUsers[0]._id;
      await Lead.findByIdAndUpdate(lead._id, { assignedToId: assignedAgentId });
      await AgentProfile.findOneAndUpdate({ userId: assignedAgentId }, { $inc: { leadsCount: 1 } });
    }

    return res.status(201).json({
      status: "success",
      leadId: lead._id,
      assignedTo: assignedAgentId || "Unassigned"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/ai/chat
export async function handleAIChat(req, res) {
  const { phone, text, companyId } = req.body;
  if (!text || !companyId) {
    return res.status(400).json({ error: "Missing required parameters: text and companyId" });
  }

  try {
    const lookupPhone = phone || "+91 00000 00000";
    let lead = await Lead.findOne({ companyId, phone: lookupPhone });

    if (!lead) {
      lead = await Lead.create({
        companyId,
        name: `Web Chat Visitor`,
        phone: lookupPhone,
        source: "Website Forms",
        status: "New",
        serviceInterest: "Web Chat Inbound"
      });
    }

    let thread = await ChatThread.findOne({ leadId: lead._id });

    if (!thread) {
      thread = await ChatThread.create({
        leadId: lead._id,
        aiAutoReply: true,
        status: "active"
      });
    }

    await Message.create({
      threadId: thread._id,
      sender: "customer",
      text,
      channel: "Web"
    });

    const company = await Company.findById(companyId).select("botPersona botTemperature botAutoPilot");
    const faqs = await KnowledgeBase.find({ companyId, category: { $ne: "document" } });
    const contextString = faqs.map(f => `Q: ${f.title}\nA: ${f.content}`).join("\n\n");

    const systemInstructions = `
      ${company?.botPersona || "You are a helpful assistant."}
      
      Here is the official knowledge base context:
      ${contextString}
      
      Answer the user's message using only the context above. If you do not know the answer, politely ask them for contact details so a human representative can reach out.
    `;

    let botReplyText = "";
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY_HERE") {
        const ai = new GoogleGenerativeAI(geminiApiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: {
            temperature: company?.botTemperature ?? 0.5,
          },
          systemInstruction: systemInstructions
        });

        botReplyText = result.response.text();
      } else {
        botReplyText = `[Simulated Gemini Web Reply] Thank you for your inquiry about "${text}". We have ready-to-move flats in Patia. What is your budget?`;
      }
    } catch (err) {
      botReplyText = `[Simulated Gemini Web Reply] Thank you for your message. An agent will follow up with you shortly.`;
    }

    await Message.create({
      threadId: thread._id,
      sender: "bot",
      text: botReplyText,
      aiResponse: botReplyText,
      channel: "Web"
    });

    return res.status(200).json({
      status: "success",
      customerMessage: text,
      botReply: botReplyText
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /webhooks/stripe
export async function handleStripeWebhook(req, res) {
  let event = req.body;

  if (event && (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded")) {
    const session = event.data?.object;
    if (session) {
      const metadata = session.metadata;
      if (metadata && metadata.companyId && metadata.planName) {
        const { companyId, planName, billingPeriod, price } = metadata;
        const priceNum = parseFloat(price || "0");

        try {
          const isCreditPack = planName.endsWith("Credits Pack");

          if (isCreditPack) {
            let creditAmount = 100;
            if (planName.startsWith("500")) creditAmount = 500;
            else if (planName.startsWith("1,500") || planName.startsWith("1500")) creditAmount = 1500;

            await Company.findByIdAndUpdate(companyId, { $inc: { credits: creditAmount } });

            const invoiceNo = `INV-STRIPE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            await Invoice.create({
              companyId,
              invoiceNo,
              date: new Date(),
              amount: `₹${priceNum.toLocaleString("en-IN")}`,
              status: "paid",
              plan: planName
            });

            await AuditLog.create({
              category: "BILLING",
              event: `Company purchased ${planName} (+${creditAmount} credits) via Stripe payment`,
              user: "Stripe Webhook",
              ip: req.ip || "127.0.0.1"
            });

            try {
              broadcastToCompany(companyId, "billing_updated", {
                planName,
                billingPeriod: "one-time",
                price: String(priceNum),
                creditsUpdated: true
              });
            } catch (err) {}
          } else {
            await Company.findByIdAndUpdate(companyId, { plan: planName });

            const startDate = new Date();
            const endDate = new Date();
            if (billingPeriod === "annually") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }

            await Subscription.create({
              companyId,
              planName,
              amount: priceNum,
              startDate,
              endDate,
              paymentStatus: "paid"
            });

            const invoiceNo = `INV-STRIPE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            await Invoice.create({
              companyId,
              invoiceNo,
              date: new Date(),
              amount: `₹${priceNum.toLocaleString("en-IN")}`,
              status: "paid",
              plan: `${planName} - ${billingPeriod === "annually" ? "Annually" : "Monthly"}`
            });

            await AuditLog.create({
              category: "BILLING",
              event: `Company upgraded workspace plan to ${planName} via Stripe payment (${billingPeriod})`,
              user: "Stripe Webhook",
              ip: req.ip || "127.0.0.1"
            });

            try {
              broadcastToCompany(companyId, "billing_updated", {
                planName,
                billingPeriod,
                price: String(priceNum)
              });
            } catch (err) {}
          }
        } catch (err) {
          console.error("Error processing Stripe webhook database updates:", err.message);
          return res.status(500).json({ error: err.message });
        }
      }
    }
  }

  return res.status(200).json({ received: true });
}
