import { WhatsappCampaign, WhatsAppTemplate, WhatsappContactGroup, WhatsappMessageLog } from "../models/index.js";
import { queueCampaign } from "../services/whatsappQueueService.js";

// GET /api/client-admin/whatsapp/campaigns
export async function getCampaigns(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaigns = await WhatsappCampaign.find({ companyId }).sort({ createdAt: -1 });

    const formatted = await Promise.all(campaigns.map(async (c) => {
      const template = c.templateId ? await WhatsAppTemplate.findById(c.templateId).select("name category") : null;
      const audiences = c.audienceGroupIds ? await WhatsappContactGroup.find({ _id: { $in: c.audienceGroupIds } }).select("name isDynamic") : [];
      const logCount = await WhatsappMessageLog.countDocuments({ campaignId: c._id });

      const obj = c.toObject();
      obj.template = template;
      obj.audiences = audiences;
      obj._count = { logs: logCount };
      return obj;
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/campaigns/:id
export async function getCampaignDetails(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaign = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const template = campaign.templateId ? await WhatsAppTemplate.findById(campaign.templateId) : null;
    const audiences = campaign.audienceGroupIds ? await WhatsappContactGroup.find({ _id: { $in: campaign.audienceGroupIds } }) : [];
    const logs = await WhatsappMessageLog.find({ campaignId: id }).sort({ createdAt: -1 }).limit(100);

    const [sentCount, deliveredCount, readCount, failedCount, queuedCount] = await Promise.all([
      WhatsappMessageLog.countDocuments({ campaignId: id, status: "SENT" }),
      WhatsappMessageLog.countDocuments({ campaignId: id, status: "DELIVERED" }),
      WhatsappMessageLog.countDocuments({ campaignId: id, status: "READ" }),
      WhatsappMessageLog.countDocuments({ campaignId: id, status: "FAILED" }),
      WhatsappMessageLog.countDocuments({ campaignId: id, status: "QUEUED" })
    ]);

    const totalCount = sentCount + deliveredCount + readCount + failedCount + queuedCount;

    const campaignObj = campaign.toObject();
    campaignObj.template = template;
    campaignObj.audiences = audiences;
    campaignObj.logs = logs;

    return res.status(200).json({
      campaign: campaignObj,
      metrics: {
        total: totalCount,
        queued: queuedCount,
        sent: sentCount,
        delivered: deliveredCount,
        read: readCount,
        failed: failedCount,
        deliveryRate: totalCount > 0 ? ((deliveredCount + readCount) / totalCount) * 100 : 0,
        readRate: totalCount > 0 ? (readCount / totalCount) * 100 : 0,
        failRate: totalCount > 0 ? (failedCount / totalCount) * 100 : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/campaigns
export async function createCampaign(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, templateId, audienceGroupIds, scheduledTime } = req.body;
  if (!name || !templateId || !audienceGroupIds || !Array.isArray(audienceGroupIds) || audienceGroupIds.length === 0) {
    return res.status(400).json({ error: "Name, templateId, and at least one audience group are required" });
  }

  try {
    const isScheduled = !!scheduledTime;
    const initialStatus = isScheduled ? "SCHEDULED" : "DRAFT";

    const campaign = await WhatsappCampaign.create({
      companyId,
      name,
      templateId,
      status: initialStatus,
      scheduledTime: isScheduled ? new Date(scheduledTime) : null,
      audienceGroupIds
    });

    return res.status(201).json(campaign);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /api/client-admin/whatsapp/campaigns/:id
export async function updateCampaign(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, templateId, audienceGroupIds, scheduledTime } = req.body;

  try {
    const existing = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (existing.status !== "DRAFT" && existing.status !== "SCHEDULED") {
      return res.status(400).json({ error: "Can only modify campaigns in Draft or Scheduled status" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (templateId !== undefined) updateData.templateId = templateId;
    if (scheduledTime !== undefined) {
      updateData.scheduledTime = scheduledTime ? new Date(scheduledTime) : null;
      updateData.status = scheduledTime ? "SCHEDULED" : "DRAFT";
    }
    if (audienceGroupIds && Array.isArray(audienceGroupIds)) {
      updateData.audienceGroupIds = audienceGroupIds;
    }

    const updated = await WhatsappCampaign.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/client-admin/whatsapp/campaigns/:id
export async function deleteCampaign(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const existing = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await WhatsappCampaign.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Campaign deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/campaigns/:id/duplicate
export async function duplicateCampaign(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const original = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!original) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const copy = await WhatsappCampaign.create({
      companyId,
      name: `Copy of ${original.name}`,
      templateId: original.templateId,
      status: "DRAFT",
      scheduledTime: null,
      audienceGroupIds: original.audienceGroupIds
    });

    return res.status(201).json(copy);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/campaigns/:id/send
export async function launchCampaignImmediately(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaign = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status === "RUNNING" || campaign.status === "COMPLETED") {
      return res.status(400).json({ error: "Campaign has already started or completed" });
    }

    queueCampaign(id, companyId).catch((err) => {
      console.error(`[WhatsApp Campaigns Controller] Failed to run campaign queue:`, err);
    });

    return res.status(200).json({ success: true, status: "RUNNING", message: "Campaign sending initiated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/campaigns/:id/cancel
export async function cancelCampaign(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaign = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== "SCHEDULED") {
      return res.status(400).json({ error: "Only scheduled campaigns can be cancelled" });
    }

    await WhatsappCampaign.findByIdAndUpdate(id, { status: "DRAFT", scheduledTime: null });

    return res.status(200).json({ success: true, status: "DRAFT", message: "Campaign schedule cancelled" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/campaigns/:id/pause
export async function pauseCampaign(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaign = await WhatsappCampaign.findOne({ _id: id, companyId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== "RUNNING") {
      return res.status(400).json({ error: "Only actively running campaigns can be paused" });
    }

    await WhatsappCampaign.findByIdAndUpdate(id, { status: "DRAFT" });

    return res.status(200).json({ success: true, status: "DRAFT", message: "Campaign paused successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/scheduled
export async function getScheduledCampaigns(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const scheduled = await WhatsappCampaign.find({ companyId, status: "SCHEDULED" }).sort({ scheduledTime: 1 });
    return res.status(200).json(scheduled);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
