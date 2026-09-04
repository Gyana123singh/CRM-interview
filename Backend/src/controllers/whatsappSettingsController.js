import { WhatsAppAccount, Company, WhatsappCampaign, WhatsappContact, WhatsappMessageLog } from "../models/index.js";

// GET /api/client-admin/whatsapp/settings
export async function getSettings(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const account = await WhatsAppAccount.findOne({ companyId });

    return res.status(200).json({
      connected: account?.status === "connected",
      account: account || null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/settings/connect
export async function connectAccount(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { phone, name, provider, apiKey, accessToken } = req.body;
  if (!phone || !name) {
    return res.status(400).json({ error: "Phone and Name are required" });
  }

  try {
    const account = await WhatsAppAccount.findOneAndUpdate(
      { companyId },
      {
        companyId,
        phone,
        name,
        provider: provider || "Cloud API",
        apiKey,
        accessToken,
        status: "connected",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json(account);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/settings/disconnect
export async function disconnectAccount(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const updated = await WhatsAppAccount.findOneAndUpdate(
      { companyId },
      { status: "disconnected" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "No WhatsApp account found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/api-keys
export async function getApiKey(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const account = await WhatsAppAccount.findOne({ companyId }).select("apiKey accessToken");

    return res.status(200).json({
      apiKey: account?.apiKey ? `${account.apiKey.substring(0, 8)}...` : null,
      hasAccessToken: !!account?.accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/client-admin/whatsapp/api-keys/regenerate
export async function regenerateApiKey(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const newKey = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 18)}`;

    const updated = await WhatsAppAccount.findOneAndUpdate(
      { companyId },
      { apiKey: newKey },
      { new: true }
    );

    return res.status(200).json({ apiKey: newKey });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/client-admin/whatsapp/billing
export async function getBillingInfo(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const company = await Company.findById(companyId).select("plan credits");

    const totalCampaigns = await WhatsappCampaign.countDocuments({ companyId });
    const totalContacts = await WhatsappContact.countDocuments({ companyId });

    const companyCampaigns = await WhatsappCampaign.find({ companyId }).select("_id");
    const campaignIds = companyCampaigns.map(c => c._id);

    const totalMessagesSent = await WhatsappMessageLog.countDocuments({
      campaignId: { $in: campaignIds },
      status: { $in: ["SENT", "DELIVERED", "READ"] }
    });

    const currentPlan = company?.plan || "Starter Plan";

    let limits = { messages: 10000, campaigns: 50, contacts: 5000 };
    if (currentPlan.toLowerCase().includes("starter")) {
      limits = { messages: 1000, campaigns: 10, contacts: 500 };
    } else if (currentPlan.toLowerCase().includes("premium")) {
      limits = { messages: 100000, campaigns: 500, contacts: 50000 };
    }

    return res.status(200).json({
      plan: currentPlan,
      credits: company?.credits || 0,
      usage: {
        messagesUsed: totalMessagesSent,
        messagesLimit: limits.messages,
        messagesRemaining: Math.max(0, limits.messages - totalMessagesSent),
        campaignCount: totalCampaigns,
        campaignLimit: limits.campaigns,
        contactCount: totalContacts,
        contactLimit: limits.contacts,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
