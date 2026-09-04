import bcrypt from "bcryptjs";
import {
  Lead,
  Customer,
  Deal,
  Activity,
  User,
  Company,
  AgentProfile,
  Invoice,
  AutomationRule,
  Appointment,
  WhatsAppAccount,
  Subscription,
  SystemPlanConfig,
  AuditLog,
  KnowledgeBase,
  ChatThread,
  Message
} from "../models/index.js";
import {
  mapLeadStatusToFrontend,
  mapLeadSourceToFrontend,
  mapRuleTriggerToFrontend,
  mapRuleTrigger
} from "../utils/mappers.js";

// GET /admin/dashboard/stats
export async function getDashboardStats(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const [
      totalLeads,
      newLeads,
      interestedLeads,
      convertedLeads,
      lostLeads,
      followUpLeads,
      totalCustomers,
      totalDeals,
      wonDeals,
      lostDeals,
      pendingActivities,
      completedActivities,
      overdueActivities,
      dealsAgg
    ] = await Promise.all([
      Lead.countDocuments({ companyId }),
      Lead.countDocuments({ companyId, status: "New" }),
      Lead.countDocuments({ companyId, status: "Interested" }),
      Lead.countDocuments({ companyId, status: "Converted" }),
      Lead.countDocuments({ companyId, status: "Lost" }),
      Lead.countDocuments({ companyId, status: "Follow-up" }),
      Customer.countDocuments({ companyId }),
      Deal.countDocuments({ companyId }),
      Deal.countDocuments({ companyId, stage: "Won" }),
      Deal.countDocuments({ companyId, stage: "Lost" }),
      Activity.countDocuments({ companyId, status: "Pending" }),
      Activity.countDocuments({ companyId, status: "Completed" }),
      Activity.countDocuments({ companyId, status: "Pending", dueDate: { $lt: new Date() } }),
      Deal.aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: null,
            pipelineValue: { $sum: "$dealValue" },
            wonRevenue: { $sum: { $cond: [{ $eq: ["$stage", "Won"] }, "$dealValue", 0] } },
            expectedRevenue: { $sum: "$expectedRevenue" }
          }
        }
      ])
    ]);

    const openDeals = Math.max(0, totalDeals - wonDeals - lostDeals);
    const agg = dealsAgg[0] || { pipelineValue: 0, wonRevenue: 0, expectedRevenue: 0 };
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const pendingReminders = followUpLeads + newLeads;

    const recentLeads = await Lead.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name serviceInterest source status createdAt");

    return res.status(200).json({
      totalLeads,
      newLeads,
      interestedLeads,
      convertedLeads,
      lostLeads,
      followUpLeads,
      conversionRate,
      pendingReminders,
      totalCustomers,
      newlyConvertedCustomers: convertedLeads,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      pipelineValue: agg.pipelineValue,
      wonRevenue: agg.wonRevenue,
      expectedRevenue: agg.expectedRevenue,
      pendingActivities,
      completedActivities,
      overdueActivities,
      aiBotResponseRate: 92,
      recentLeads: recentLeads.map(l => ({
        id: l._id,
        name: l.name,
        serviceInterest: l.serviceInterest,
        source: mapLeadSourceToFrontend(l.source),
        status: mapLeadStatusToFrontend(l.status),
        createdAt: l.createdAt.toISOString()
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/dashboard/lead-sources
export async function getLeadSources(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const sourceGroups = await Lead.aggregate([
      { $match: { companyId } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalLeads = sourceGroups.reduce((sum, g) => sum + g.count, 0);

    const sources = sourceGroups.map(g => ({
      source: mapLeadSourceToFrontend(g._id),
      count: g.count,
      percentage: totalLeads > 0 ? Math.round((g.count / totalLeads) * 100) : 0
    }));

    return res.status(200).json({ sources, totalLeads });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/reports
export async function getReports(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const agents = await User.find({ companyId, role: "team" });

    const performanceData = await Promise.all(agents.map(async (agent) => {
      const profile = await AgentProfile.findOne({ userId: agent._id });
      const leads = profile?.leadsCount || 0;
      const rate = profile?.conversionRate || 0;
      return {
        name: agent.name,
        leads,
        converted: Math.round((rate / 100) * leads),
        rate: `${rate}%`
      };
    }));

    const [totalLeads, convertedLeads, followUpLeads] = await Promise.all([
      Lead.countDocuments({ companyId }),
      Lead.countDocuments({ companyId, status: "Converted" }),
      Lead.countDocuments({ companyId, status: "Follow-up" }),
    ]);

    const funnel = [
      { stage: "Ad Click / Inquiries", percentage: 90, value: `${totalLeads} Leads` },
      { stage: "WhatsApp Qualify", percentage: 70, value: `${Math.round(totalLeads * 0.7)} Qualified` },
      { stage: "Sales Call Demo", percentage: 45, value: `${Math.round(totalLeads * 0.45)} Scheduled` },
      { stage: "Paying Conversions", percentage: 25, value: `${convertedLeads} Closed` },
    ];

    return res.status(200).json({
      performanceData,
      funnel,
      meanResponseTimeSeconds: 45,
      totalConvertedDeals: convertedLeads,
      pendingFollowUps: followUpLeads,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /admin/agents
export async function getAgents(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const agents = await User.find({ companyId, role: { $in: ["sales-manager", "sales-executive", "team"] } });

    const formatted = await Promise.all(agents.map(async (a) => {
      const profile = await AgentProfile.findOne({ userId: a._id });
      return {
        id: a._id,
        name: a.name,
        email: a.email,
        role: a.role,
        phone: a.phone || profile?.phone || "",
        status: (profile?.status || "offline").toLowerCase(),
        leadsCount: profile?.leadsCount || 0,
        conversionRate: profile?.conversionRate || 0,
        specialty: profile?.specialty || "General Sales Desk",
        joinedDate: profile?.joinedDate ? profile.joinedDate.toISOString().split("T")[0] : "",
        isActive: a.status === "active",
        fatherName: profile?.fatherName || "",
        address: profile?.address || "",
        profileImage: profile?.profileImage || ""
      };
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /admin/agents (Admin Registers Sales Manager & Sales Executive Credentials)
export async function createAgent(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, email, phone, role, specialty, password, fatherName, address, status, profileImage } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone number are required" });
  }

  const allowedRoles = ["sales-manager", "sales-executive", "team"];
  const targetRole = role && allowedRoles.includes(role) ? role : "sales-executive";

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const rawPassword = password && password.trim() ? password.trim() : "securepassword";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: targetRole,
      status: "active",
      companyId
    });

    const statusMap = { online: "online", busy: "busy", offline: "offline" };
    const mappedStatus = statusMap[status] || "online";

    const agentProfile = await AgentProfile.create({
      userId: user._id,
      phone,
      specialty: specialty || (targetRole === "sales-manager" ? "Sales Strategy & Operations" : "High-Ticket Sales"),
      status: mappedStatus,
      isActive: true,
      leadsCount: 0,
      conversionRate: 0,
      fatherName: fatherName || "",
      address: address || "",
      profileImage: profileImage || ""
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || agentProfile.phone,
      status: agentProfile.status,
      specialty: agentProfile.specialty,
      isActive: user.status === "active"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /agents/:id (Edit Agent Profile)
export async function updateAgent(req, res) {
  const { id } = req.params;
  const { name, fatherName, email, phone, password, address, specialty, status, profileImage } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required" });
  }

  try {
    const userUpdateData = { name, email, phone };
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(id, userUpdateData, { new: true });
    if (!user) return res.status(404).json({ error: "Agent not found" });

    const statusMap = { online: "online", busy: "busy", offline: "offline" };
    const mappedStatus = statusMap[status] || "offline";

    const agentProfile = await AgentProfile.findOneAndUpdate(
      { userId: id },
      {
        phone: phone,
        specialty: specialty || "General Support Desk",
        status: mappedStatus,
        fatherName: fatherName || "",
        address: address || "",
        profileImage: profileImage || ""
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      id: user._id,
      name: user.name,
      fatherName: agentProfile.fatherName || "",
      email: user.email,
      phone: user.phone || phone,
      address: agentProfile.address || "",
      status: agentProfile.status.toLowerCase(),
      specialty: agentProfile.specialty,
      leadsCount: agentProfile.leadsCount,
      conversionRate: agentProfile.conversionRate,
      joinedDate: agentProfile.joinedDate.toISOString().split("T")[0],
      isActive: user.status === "active",
      profileImage: agentProfile.profileImage || ""
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /agents/:id/active
export async function toggleAgentActive(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ error: "isActive parameter is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { status: isActive ? "active" : "suspended" },
      { new: true }
    );

    await AgentProfile.findOneAndUpdate(
      { userId: id },
      { isActive: !!isActive }
    );

    return res.status(200).json({ id: user._id, isActive: user.status === "active" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /agents/:id
export async function deleteAgent(req, res) {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    await AgentProfile.deleteOne({ userId: id });
    return res.status(200).json({ message: "Agent removed from roster successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /routing-policy
export async function getRoutingPolicy(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const company = await Company.findById(companyId).select("routingPolicy");
    if (!company) return res.status(404).json({ error: "Company not found" });
    return res.status(200).json({ routingPolicy: company.routingPolicy });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /routing-policy
export async function updateRoutingPolicy(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { routingPolicy } = req.body;
  if (!routingPolicy || (routingPolicy !== "round-robin" && routingPolicy !== "load-balanced")) {
    return res.status(400).json({ error: "Invalid routing policy" });
  }

  try {
    const company = await Company.findByIdAndUpdate(companyId, { routingPolicy }, { new: true });
    return res.status(200).json({ routingPolicy: company.routingPolicy });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /whatsapp/pairing-code
export async function generatePairingCode(req, res) {
  return res.status(200).json({ pairingCode: "KV82-9X42" });
}

// POST /whatsapp/verify
export async function verifyWhatsapp(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });
  const { phone, name, connected } = req.body;

  try {
    const isConnected = connected !== undefined ? !!connected : true;

    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        whatsappPhone: phone || (isConnected === false ? null : "+91 94380 99999"),
        whatsappName: name || (isConnected === false ? null : "Infotattva Business Live Desk"),
        whatsappConnected: isConnected
      },
      { new: true }
    );

    if (isConnected) {
      const token = process.env.WHATSAPP_ACCESS_TOKEN || null;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;

      await WhatsAppAccount.findOneAndUpdate(
        { companyId },
        {
          phone: phone || "+91 94380 99999",
          name: name || "Infotattva Business Live Desk",
          accessToken: token,
          apiKey: phoneId,
          status: "connected"
        },
        { upsert: true }
      );
    } else {
      await WhatsAppAccount.updateMany({ companyId }, { status: "disconnected" });
    }

    return res.status(200).json({
      whatsappConnected: company.whatsappConnected,
      whatsappPhone: company.whatsappPhone,
      whatsappName: company.whatsappName
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /meta-forms
export async function getMetaForms(req, res) {
  return res.status(200).json([
    { id: "form_01", formName: "Patia 2BHK Campaign Form", pageName: "Infotattva Real Estates", leadsSynced: 148, isActive: true },
    { id: "form_02", formName: "AI WhatsApp Chatbot Consultation Form", pageName: "Infotattva Solutions", leadsSynced: 92, isActive: true },
    { id: "form_03", formName: "Salons Booking Retainer Form", pageName: "Elite Spas & Salons", leadsSynced: 35, isActive: false }
  ]);
}

// POST /smtp/verify
export async function verifySMTP(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { smtpHost, smtpPort, smtpUser, smtpPass, smtpEncryption } = req.body;

  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpEncryption,
        smtpVerified: true
      },
      { new: true }
    );
    return res.status(200).json({
      smtpVerified: company.smtpVerified,
      smtpHost: company.smtpHost,
      smtpUser: company.smtpUser
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/company/config
export async function getCompanyConfig(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const company = await Company.findById(companyId).select(
      "whatsappPhone whatsappName whatsappConnected smtpHost smtpPort smtpUser smtpEncryption smtpVerified"
    );

    if (!company) return res.status(404).json({ error: "Company not found" });

    return res.status(200).json(company);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/billing/plan
export async function getBillingPlan(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const company = await Company.findById(companyId).select("plan companyName");

    if (!company) return res.status(404).json({ error: "Company not found" });

    return res.status(200).json({ currentPlan: company.plan });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/billing/plans
export async function getSystemPlansForClient(req, res) {
  try {
    let plans = await SystemPlanConfig.find({});
    if (plans.length === 0) {
      await SystemPlanConfig.insertMany([
        { name: "Starter Plan", priceMonthly: 5000, maxChannels: 1, maxSeats: 2, maxTokens: 10000 },
        { name: "Growth Plan", priceMonthly: 15000, maxChannels: 5, maxSeats: 5, maxTokens: 50000 },
        { name: "Premium Plan", priceMonthly: 50000, maxChannels: 99, maxSeats: 99, maxTokens: 200000 }
      ]);
      plans = await SystemPlanConfig.find({});
    }
    return res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /client-admin/billing/plan
export async function upgradeBillingPlan(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { plan } = req.body;
  if (!plan) {
    return res.status(400).json({ error: "Plan name is required." });
  }

  try {
    const planConfig = await SystemPlanConfig.findOne({ name: plan });
    if (!planConfig) {
      return res.status(400).json({ error: `Invalid plan type: ${plan}` });
    }

    const company = await Company.findByIdAndUpdate(companyId, { plan: plan }, { new: true });

    await AuditLog.create({
      category: "BILLING",
      event: `Company upgraded workspace plan to ${plan}`,
      user: req.user?.email || "admin",
      ip: req.ip || "127.0.0.1"
    });

    return res.status(200).json({ currentPlan: company.plan, message: `Plan successfully upgraded to ${plan}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/billing/quotas
export async function getBillingQuotas(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const company = await Company.findById(companyId);
    const activeSeatsCount = await User.countDocuments({ companyId, role: "team" });

    const planName = company?.plan || "Starter Plan";
    const planConfig = await SystemPlanConfig.findOne({ name: planName });

    const quotas = {
      chatbotUsedTokens: 7412,
      chatbotMaxTokens: planConfig?.maxTokens ?? (planName.toLowerCase().includes("premium") ? 200000 : planName.toLowerCase().includes("growth") ? 50000 : 10000),
      whatsappUsedMessages: 22504,
      whatsappMaxMessages: planName.toLowerCase().includes("premium") ? 100000 : planName.toLowerCase().includes("growth") ? 50000 : 10000,
      usedSeats: activeSeatsCount,
      maxSeats: planConfig?.maxSeats ?? (planName.toLowerCase().includes("premium") ? 99 : planName.toLowerCase().includes("growth") ? 5 : 2),
      credits: company?.credits ?? 1000
    };

    return res.status(200).json(quotas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /billing/invoices
export async function getInvoices(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    let invoices = await Invoice.find({ companyId }).sort({ date: -1 });

    if (invoices.length === 0) {
      await Invoice.insertMany([
        { companyId, invoiceNo: "INV-2026-004", date: new Date("2026-05-28"), amount: "₹15,000", status: "paid", plan: "Growth Plan - Monthly" },
        { companyId, invoiceNo: "INV-2026-003", date: new Date("2026-04-28"), amount: "₹15,000", status: "paid", plan: "Growth Plan - Monthly" },
        { companyId, invoiceNo: "INV-2026-002", date: new Date("2026-03-28"), amount: "₹15,000", status: "paid", plan: "Growth Plan - Monthly" },
        { companyId, invoiceNo: "INV-2026-001", date: new Date("2026-02-28"), amount: "₹25,000", status: "paid", plan: "Starter setup fee" }
      ]);
      invoices = await Invoice.find({ companyId }).sort({ date: -1 });
    }

    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/automation-rules
export async function getAutomationRules(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    let rules = await AutomationRule.find({ companyId }).sort({ createdAt: -1 });

    if (rules.length === 0) {
      await AutomationRule.insertMany([
        {
          companyId,
          name: "Instant WhatsApp Welcome Flow",
          trigger: "New Lead Created",
          condition: "Source is Meta Ads or Website",
          actions: ["Send Welcome WhatsApp Message", "Auto-Assign to Sales Executive", "Notify Admin via Email"],
          delay: "Instant",
          status: "active"
        },
        {
          companyId,
          name: "Follow-up Delay Reminder",
          trigger: "Status Updated",
          condition: "Status equals 'Follow-up'",
          actions: ["Send Follow-up Reminder", "Create Pending Task for Assigned Executive"],
          delay: "24 Hours",
          status: "active"
        },
        {
          companyId,
          name: "Cold Lead Re-engagement",
          trigger: "No Customer Response",
          condition: "Duration is 3 Days",
          actions: ["Send 'Missed You' Discount/Offer Message", "Mark Lead as Cold/Lost"],
          delay: "3 Days",
          status: "paused"
        }
      ]);

      rules = await AutomationRule.find({ companyId }).sort({ createdAt: -1 });
    }

    return res.status(200).json(rules.map(r => ({
      id: r._id,
      name: r.name,
      trigger: mapRuleTriggerToFrontend(r.trigger),
      condition: r.condition,
      actions: r.actions,
      delay: r.delay,
      status: r.status.toLowerCase(),
      createdAt: r.createdAt.toISOString()
    })));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /client-admin/automation-rules
export async function createAutomationRule(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, trigger, condition, actions, delay } = req.body;
  if (!name || !trigger || !actions || actions.length === 0) {
    return res.status(400).json({ error: "Missing required rule parameters" });
  }

  const dbTrigger = mapRuleTrigger(trigger);

  try {
    const rule = await AutomationRule.create({
      companyId,
      name,
      trigger: dbTrigger,
      condition: condition || "No conditions apply",
      actions: actions,
      delay: delay || "Instant",
      status: "active"
    });

    return res.status(201).json({
      id: rule._id,
      name: rule.name,
      trigger: mapRuleTriggerToFrontend(rule.trigger),
      condition: rule.condition,
      actions: rule.actions,
      delay: rule.delay,
      status: rule.status.toLowerCase(),
      createdAt: rule.createdAt.toISOString()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /client-admin/automation-rules/:id/status
export async function toggleRuleStatus(req, res) {
  const { id } = req.params;

  try {
    const rule = await AutomationRule.findById(id);
    if (!rule) return res.status(404).json({ error: "Automation rule not found" });

    const newStatus = rule.status === "active" ? "paused" : "active";
    const updated = await AutomationRule.findByIdAndUpdate(id, { status: newStatus }, { new: true });

    return res.status(200).json({ id: updated._id, status: updated.status.toLowerCase() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /client-admin/automation-rules/:id
export async function deleteAutomationRule(req, res) {
  const { id } = req.params;
  try {
    await AutomationRule.findByIdAndDelete(id);
    return res.status(200).json({ message: "Automation rule deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /client-admin/appointments/slots
export async function getAppointmentSlots(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const dateStr = req.query.date || new Date().toISOString().split("T")[0];
  const allSlots = ["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

  try {
    const targetDate = new Date(dateStr);
    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedAppointments = await Appointment.find({
      companyId,
      appointmentDate: { $gte: targetDate, $lt: nextDay },
      status: { $in: ["confirmed", "pending"] }
    }).select("appointmentTime");

    const bookedTimes = new Set(bookedAppointments.map(a => a.appointmentTime));

    const slots = allSlots.map(time => ({
      time,
      available: !bookedTimes.has(time)
    }));

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /appointments/:id/confirm
export async function confirmAppointment(req, res) {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "confirmed" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    return res.status(200).json({
      id: appointment._id,
      status: String(appointment.status).toLowerCase()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /client-admin/seed
export async function seedDatabase(req, res) {
  try {
    await Promise.all([
      AuditLog.deleteMany({}),
      Appointment.deleteMany({}),
      Invoice.deleteMany({}),
      AutomationRule.deleteMany({}),
      Message.deleteMany({}),
      ChatThread.deleteMany({}),
      Lead.deleteMany({}),
      AgentProfile.deleteMany({}),
      User.deleteMany({}),
      Subscription.deleteMany({}),
      KnowledgeBase.deleteMany({}),
      Company.deleteMany({})
    ]);

    const company = await Company.create({
      _id: "company-infotattva-id",
      companyName: "Infotattva Business Solutions",
      industry: "SaaS & Retail Solutions",
      contactPerson: "Pradeep Patra",
      phone: "+91 94380 99999",
      email: "contact@infotattva.com",
      address: "Bhubaneswar, Odisha, India",
      plan: "Growth Plan",
      status: "active",
      routingPolicy: "round-robin",
      whatsappPhone: "+91 94380 99999",
      whatsappName: "Infotattva Business Live Desk",
      whatsappConnected: true,
      smtpVerified: true,
      smtpHost: "smtp.infotattva.com",
      smtpPort: "587",
      smtpUser: "alerts@infotattva.com",
      smtpPass: "securepassword",
      smtpEncryption: "SSL/TLS"
    });

    await Subscription.create({
      companyId: company._id,
      planName: "Growth Plan",
      amount: 15000,
      startDate: new Date("2026-05-28"),
      endDate: new Date("2026-06-28"),
      paymentStatus: "paid"
    });

    const hashedPassword = await bcrypt.hash("securepassword", 10);

    const pradeep = await User.create({
      _id: "user-pradeep-id",
      name: "Pradeep Patra",
      email: "pradeep@infotattva.com",
      phone: "+91 94380 12345",
      password: hashedPassword,
      role: "admin",
      status: "active",
      companyId: company._id
    });

    const amit = await User.create({
      _id: "user-amit-id",
      name: "Amit Sharma",
      email: "sales@infotattva.com",
      phone: "+91 94380 54321",
      password: hashedPassword,
      role: "team",
      status: "active",
      companyId: company._id
    });

    const rina = await User.create({
      _id: "user-rina-id",
      name: "Rina Das",
      email: "rina@infotattva.com",
      phone: "+91 88888 99999",
      password: hashedPassword,
      role: "team",
      status: "active",
      companyId: company._id
    });

    const debasish = await User.create({
      _id: "user-debasish-id",
      name: "Debasish Panda",
      email: "debasish@infotattva.com",
      phone: "+91 77777 88888",
      password: hashedPassword,
      role: "team",
      status: "suspended",
      companyId: company._id
    });

    await AgentProfile.insertMany([
      {
        userId: pradeep._id,
        phone: "+91 94380 12345",
        status: "online",
        specialty: "AI & Tech Integration",
        isActive: true,
        leadsCount: 8,
        conversionRate: 52.0,
        joinedDate: new Date("2025-02-15")
      },
      {
        userId: amit._id,
        phone: "+91 94380 54321",
        status: "online",
        specialty: "High-Ticket Real Estate",
        isActive: true,
        leadsCount: 14,
        conversionRate: 48.0,
        joinedDate: new Date("2025-01-10")
      },
      {
        userId: rina._id,
        phone: "+91 88888 99999",
        status: "online",
        specialty: "SaaS & Retail Solutions",
        isActive: true,
        leadsCount: 11,
        conversionRate: 35.0,
        joinedDate: new Date("2025-03-01")
      },
      {
        userId: debasish._id,
        phone: "+91 77777 88888",
        status: "offline",
        specialty: "General Support Desk",
        isActive: false,
        leadsCount: 0,
        conversionRate: 0.0,
        joinedDate: new Date("2025-04-20")
      }
    ]);

    const rahulLead = await Lead.create({
      _id: "lead-rahul-id",
      name: "Rahul Mohanty",
      phone: "+91 98765 43210",
      email: "rahul.m@gmail.com",
      location: "Patia, Bhubaneswar",
      serviceInterest: "2BHK Luxury Flat",
      message: "Looking for a ready to move 2BHK flat near Patia within 60 Lakhs budget.",
      source: "Meta Ads",
      status: "New",
      companyId: company._id,
      assignedToId: amit._id,
      createdAt: new Date("2026-05-30T09:30:00Z")
    });

    const sunitaLead = await Lead.create({
      _id: "lead-sunita-id",
      name: "Dr. Sunita Rao",
      phone: "+91 94321 09876",
      email: "sunita.rao@healthclinic.in",
      location: "Saheed Nagar",
      serviceInterest: "AI WhatsApp Chatbot integration",
      message: "Need a WhatsApp bot for automatic appointment confirmation and scheduling.",
      source: "WhatsApp",
      status: "Interested",
      companyId: company._id,
      assignedToId: pradeep._id,
      notes: "Very eager. Requested a demo of salon/spa calendar flow.",
      followUpDate: new Date("2026-06-01"),
      createdAt: new Date("2026-05-30T10:15:00Z")
    });

    const rahulThread = await ChatThread.create({
      leadId: rahulLead._id,
      aiAutoReply: true,
      status: "active"
    });
    await Message.insertMany([
      {
        threadId: rahulThread._id,
        sender: "customer",
        text: "Hi, I saw your ad for Patia 2BHK luxury flats.",
        channel: "WhatsApp",
        timestamp: new Date("2026-05-30T09:30:00Z")
      },
      {
        threadId: rahulThread._id,
        sender: "bot",
        text: "Hi Rahul, thank you for your inquiry! We have beautiful 2BHK ready-to-move flats in Patia. May I know your preferred budget range so we can suggest the best options?",
        channel: "WhatsApp",
        timestamp: new Date("2026-05-30T09:30:05Z")
      }
    ]);

    const sunitaThread = await ChatThread.create({
      leadId: sunitaLead._id,
      aiAutoReply: false,
      status: "active"
    });
    await Message.insertMany([
      {
        threadId: sunitaThread._id,
        sender: "customer",
        text: "Do you have calendar bookings integrated in WhatsApp?",
        channel: "WhatsApp",
        timestamp: new Date("2026-05-30T10:10:00Z")
      },
      {
        threadId: sunitaThread._id,
        sender: "agent",
        text: "Yes Dr. Sunita, we support full WhatsApp-based booking slots. A client can view open slots and confirm immediately.",
        channel: "WhatsApp",
        timestamp: new Date("2026-05-30T10:14:00Z")
      }
    ]);

    return res.status(200).json({ success: true, message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Database seed failed:", error);
    return res.status(500).json({ error: error.message });
  }
}

// POST /client-admin/billing/checkout-session
export async function createCheckoutSession(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { planName, billingPeriod } = req.body;
  if (!planName) {
    return res.status(400).json({ error: "Plan name is required" });
  }

  try {
    let price = 0;
    const isCreditPack = planName.endsWith("Credits Pack");

    if (isCreditPack) {
      if (planName.startsWith("100")) price = 1000;
      else if (planName.startsWith("500")) price = 4000;
      else if (planName.startsWith("1,500") || planName.startsWith("1500")) price = 10000;
      else return res.status(400).json({ error: `Invalid credits pack: ${planName}` });
    } else {
      const planConfig = await SystemPlanConfig.findOne({ name: planName });
      if (!planConfig) {
        return res.status(404).json({ error: `System plan configuration not found for: ${planName}` });
      }

      price = billingPeriod === "annually"
        ? Math.round(planConfig.priceMonthly * 12 * 0.8)
        : planConfig.priceMonthly;
    }

    const sandboxUrl = `http://localhost:3000/admin/billing/sandbox-checkout?planName=${encodeURIComponent(planName)}&billingPeriod=${billingPeriod || "one-time"}&price=${price}&companyId=${companyId}`;
    return res.status(200).json({ url: sandboxUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
