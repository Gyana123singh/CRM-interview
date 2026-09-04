import { WhatsappContact, WhatsappCampaign, WhatsappContactGroup, WhatsappMessageLog } from "../models/index.js";

// GET /api/client-admin/whatsapp/reports/dashboard
export async function getDashboardStats(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaigns = await WhatsappCampaign.find({ companyId }).select("_id");
    const campaignIds = campaigns.map(c => c._id);

    const [
      totalContacts,
      totalCampaigns,
      totalGroups,
      totalSent,
      totalDelivered,
      totalRead,
      totalFailed,
      totalQueued,
    ] = await Promise.all([
      WhatsappContact.countDocuments({ companyId }),
      WhatsappCampaign.countDocuments({ companyId }),
      WhatsappContactGroup.countDocuments({ companyId }),
      WhatsappMessageLog.countDocuments({ campaignId: { $in: campaignIds }, status: "SENT" }),
      WhatsappMessageLog.countDocuments({ campaignId: { $in: campaignIds }, status: "DELIVERED" }),
      WhatsappMessageLog.countDocuments({ campaignId: { $in: campaignIds }, status: "READ" }),
      WhatsappMessageLog.countDocuments({ campaignId: { $in: campaignIds }, status: "FAILED" }),
      WhatsappMessageLog.countDocuments({ campaignId: { $in: campaignIds }, status: "QUEUED" }),
    ]);

    const totalMessages = totalSent + totalDelivered + totalRead + totalFailed + totalQueued;

    return res.status(200).json({
      totalContacts,
      totalCampaigns,
      totalGroups,
      messages: {
        total: totalMessages,
        sent: totalSent,
        delivered: totalDelivered,
        read: totalRead,
        failed: totalFailed,
        queued: totalQueued,
        deliveryRate: totalMessages > 0 ? (((totalDelivered + totalRead) / totalMessages) * 100).toFixed(1) : "0.0",
        readRate: totalMessages > 0 ? ((totalRead / totalMessages) * 100).toFixed(1) : "0.0",
        failRate: totalMessages > 0 ? ((totalFailed / totalMessages) * 100).toFixed(1) : "0.0",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/reports/campaigns
export async function getCampaignPerformance(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaigns = await WhatsappCampaign.find({ companyId })
      .select("_id name status createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    const campaignStats = await Promise.all(
      campaigns.map(async (c) => {
        const delivered = await WhatsappMessageLog.countDocuments({ campaignId: c._id, status: { $in: ["DELIVERED", "READ"] } });
        const read = await WhatsappMessageLog.countDocuments({ campaignId: c._id, status: "READ" });
        const failed = await WhatsappMessageLog.countDocuments({ campaignId: c._id, status: "FAILED" });
        const total = await WhatsappMessageLog.countDocuments({ campaignId: c._id });

        return {
          id: c._id,
          name: c.name,
          status: c.status,
          createdAt: c.createdAt,
          totalMessages: total,
          delivered,
          read,
          failed,
          deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0",
          readRate: total > 0 ? ((read / total) * 100).toFixed(1) : "0.0",
          failRate: total > 0 ? ((failed / total) * 100).toFixed(1) : "0.0",
        };
      })
    );

    return res.status(200).json(campaignStats);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/reports/trends
export async function getMessageTrends(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { period = "daily" } = req.query;

  try {
    const campaigns = await WhatsappCampaign.find({ companyId }).select("_id");
    const campaignIds = campaigns.map(c => c._id);

    const logs = await WhatsappMessageLog.find({ campaignId: { $in: campaignIds } })
      .select("status createdAt")
      .sort({ createdAt: 1 });

    const buckets = {};

    logs.forEach((log) => {
      let key;
      const d = new Date(log.createdAt);
      if (period === "monthly") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "weekly") {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = d.toISOString().split("T")[0];
      }

      if (!buckets[key]) {
        buckets[key] = { sent: 0, delivered: 0, read: 0, failed: 0 };
      }

      if (log.status === "SENT") buckets[key].sent++;
      else if (log.status === "DELIVERED") buckets[key].delivered++;
      else if (log.status === "READ") buckets[key].read++;
      else if (log.status === "FAILED") buckets[key].failed++;
    });

    const trendData = Object.entries(buckets).map(([date, stats]) => ({
      date,
      ...stats,
      total: stats.sent + stats.delivered + stats.read + stats.failed,
    }));

    return res.status(200).json(trendData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/reports/recent-activity
export async function getRecentActivity(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const campaigns = await WhatsappCampaign.find({ companyId }).select("_id name");
    const campaignMap = new Map(campaigns.map(c => [String(c._id), c.name]));
    const campaignIds = campaigns.map(c => c._id);

    const recentLogs = await WhatsappMessageLog.find({ campaignId: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .limit(50);

    const populatedLogs = await Promise.all(recentLogs.map(async (log) => {
      const contact = await WhatsappContact.findById(log.contactId).select("firstName lastName mobile");
      const logObj = log.toObject();
      logObj.contact = contact;
      logObj.campaign = { name: campaignMap.get(String(log.campaignId)) || "Campaign" };
      return logObj;
    }));

    return res.status(200).json(populatedLogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
