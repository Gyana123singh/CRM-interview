import { Lead, Customer, Deal, Activity, Notification, ChatThread, Message, User, AgentProfile, Company, AuditLog } from "../models/index.js";
import {
  mapLeadStatusToFrontend,
  mapLeadStatus,
  mapLeadSourceToFrontend,
  mapLeadSource
} from "../utils/mappers.js";
import { broadcastToCompany } from "../utils/sse.js";
import { emitLeadEvent, emitNotificationCreated } from "../services/socketEvents.js";

// GET /leads
export async function getLeads(req, res) {
  let companyId = req.user?.companyId;

  const { status, source, priority, assignedToId, startDate, endDate, search, page, limit, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  try {
    // Smart Company ID Resolution: Ensure companyId matches where leads exist
    let targetCompanyId = companyId;
    if (targetCompanyId) {
      const leadCount = await Lead.countDocuments({ companyId: targetCompanyId });
      if (leadCount === 0) {
        const existingLead = await Lead.findOne({});
        if (existingLead) {
          targetCompanyId = existingLead.companyId;
        }
      }
    } else {
      const existingLead = await Lead.findOne({});
      if (existingLead) {
        targetCompanyId = existingLead.companyId;
      }
    }

    const filters = {};
    if (targetCompanyId) {
      filters.companyId = targetCompanyId;
    }

    const isAllFilter = (val) => !val || val === "All" || val === "undefined" || val === "null" || String(val).trim() === "" || String(val).toLowerCase().includes("all");

    if (!isAllFilter(status)) {
      filters.status = mapLeadStatus(String(status));
    }
    if (!isAllFilter(source)) {
      const mapped = mapLeadSource(String(source));
      if (mapped === "Website Forms" || String(source).toUpperCase().includes("WEBSITE")) {
        filters.source = { $in: ["Website Forms", "Website", "WEBSITE_FORMS"] };
      } else {
        filters.source = mapped;
      }
    }
    if (!isAllFilter(priority)) {
      filters.priority = String(priority);
    }
    if (assignedToId && !isAllFilter(assignedToId)) {
      filters.assignedToId = String(assignedToId);
    }
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      const searchRegex = new RegExp(String(search), "i");
      filters.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { serviceInterest: searchRegex }
      ];
    }

    const sortObj = { [String(sortBy)]: String(sortOrder).toLowerCase() === "asc" ? 1 : -1 };

    const mapLeadData = async (l) => {
      const cust = await Customer.findOne({ leadId: l._id });
      let agentName = "Unassigned";
      if (l.assignedToId) {
        const agent = await User.findById(l.assignedToId).select("name email");
        if (agent) agentName = agent.name;
      }
      return {
        id: l._id,
        name: l.name,
        phone: l.phone,
        email: l.email || "",
        location: l.location || "N/A",
        serviceInterest: l.serviceInterest,
        message: l.message || "",
        source: mapLeadSourceToFrontend(l.source),
        priority: l.priority || "Medium",
        status: mapLeadStatusToFrontend(l.status),
        assignedTo: agentName,
        assignedToId: l.assignedToId || null,
        followUpDate: l.followUpDate ? l.followUpDate.toISOString().split("T")[0] : undefined,
        notes: l.notes || "",
        createdAt: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
        customer: cust ? { id: cust._id, name: cust.name } : null
      };
    };

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [total, leads] = await Promise.all([
        Lead.countDocuments(filters),
        Lead.find(filters)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
      ]);

      const mapped = await Promise.all(leads.map(mapLeadData));

      return res.status(200).json({
        success: true,
        data: {
          items: mapped,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    }

    const leads = await Lead.find(filters).sort({ createdAt: -1 });
    const mapped = await Promise.all(leads.map(mapLeadData));

    return res.status(200).json(mapped);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /leads (Manual Add Lead)
export async function createLead(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { name, phone, email, location, serviceInterest, message, source, assignedTo } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone number are required" });
  }

  try {
    let assignedToId = null;
    if (assignedTo && assignedTo !== "Unassigned") {
      const user = await User.findOne({ companyId, _id: assignedTo });
      if (user) assignedToId = user._id;
    }

    const lead = await Lead.create({
      companyId,
      name,
      phone,
      email,
      location,
      serviceInterest: serviceInterest || "AI Integration Consultation",
      message: message || "Manually registered lead inquiry.",
      source: source ? mapLeadSource(String(source)) : "Manual Entry",
      status: "New",
      assignedToId
    });

    try {
      broadcastToCompany(companyId, "lead_created", {
        id: lead._id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || "",
        location: lead.location || "N/A",
        serviceInterest: lead.serviceInterest,
        message: lead.message || "",
        source: mapLeadSourceToFrontend(lead.source),
        status: mapLeadStatusToFrontend(lead.status),
        assignedTo: lead.assignedToId || "Unassigned",
        notes: lead.notes || "",
        createdAt: lead.createdAt.toISOString()
      });
    } catch (err) { }

    await ChatThread.create({
      leadId: lead._id,
      aiAutoReply: true,
      status: "active"
    });

    return res.status(201).json({
      id: lead._id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || "",
      location: lead.location || "N/A",
      serviceInterest: lead.serviceInterest,
      message: lead.message || "",
      source: mapLeadSourceToFrontend(lead.source),
      status: mapLeadStatusToFrontend(lead.status),
      assignedTo: lead.assignedToId || "Unassigned",
      notes: lead.notes || "",
      createdAt: lead.createdAt.toISOString()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/leads/create (Lead Capture API - public/external)
export async function captureLead(req, res) {
  let { name, phone, email, location, serviceInterest, message, source, companyId } = req.body;
  if (!companyId) {
    companyId = "company-infotattva-id";
  }
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  try {
    const lead = await Lead.create({
      companyId,
      name,
      phone,
      email,
      location,
      serviceInterest: serviceInterest || "Inbound Web Inquiry",
      message: message || "Automated lead ingestion.",
      source: source ? mapLeadSource(String(source)) : "Website Forms",
      status: "New"
    });

    const thread = await ChatThread.create({
      leadId: lead._id,
      aiAutoReply: true,
      status: "active"
    });

    const welcomeMsg = await Message.create({
      threadId: thread._id,
      sender: "bot",
      text: `Hi ${name}, thank you for your interest in our ${serviceInterest || "services"}! Our team has received your request and will contact you shortly.`,
      channel: "WhatsApp"
    });

    try {
      broadcastToCompany(companyId, "lead_created", lead);
      emitLeadEvent(companyId, "lead_created", lead);
      broadcastToCompany(companyId, "message_created", {
        leadId: lead._id,
        id: welcomeMsg._id,
        sender: "bot",
        text: welcomeMsg.text,
        timestamp: welcomeMsg.timestamp.toISOString(),
        channel: welcomeMsg.channel
      });
    } catch (err) { }

    const company = await Company.findById(companyId).select("routingPolicy");
    const activeUsers = await User.find({ companyId, role: "team" });

    let assignedAgentId = null;
    if (activeUsers.length > 0) {
      assignedAgentId = activeUsers[0]._id;
      await Lead.findByIdAndUpdate(lead._id, { assignedToId: assignedAgentId });
      await AgentProfile.findOneAndUpdate({ userId: assignedAgentId }, { $inc: { leadsCount: 1 } });
    }

    try {
      const adminUser = await User.findOne({ companyId, role: { $in: ["admin", "client-admin", "sales-manager"] } });
      if (adminUser) {
        const notif = await Notification.create({
          companyId,
          userId: adminUser._id,
          type: "LEAD_CREATED",
          title: `⚡ New ${lead.source || "Website"} Lead Captured`,
          message: `Inbound lead "${lead.name}" (${lead.phone}) captured for "${lead.serviceInterest}"`,
          link: "/admin/leads"
        });
        emitNotificationCreated(companyId, adminUser._id, notif);
      }

      if (assignedAgentId && (!adminUser || String(adminUser._id) !== String(assignedAgentId))) {
        const agentNotif = await Notification.create({
          companyId,
          userId: assignedAgentId,
          type: "LEAD_ASSIGNED",
          title: "⚡ Inbound Lead Assigned",
          message: `Inbound lead "${lead.name}" (${lead.phone}) has been assigned to you.`,
          link: "/admin/leads"
        });
        emitNotificationCreated(companyId, assignedAgentId, agentNotif);
      }
    } catch (nErr) { }

    await AuditLog.create({
      category: "AI Engine",
      event: `Captured Lead ${name} assigned to agent: ${assignedAgentId || "Unassigned"}`,
      user: "Lead API Ingestion",
      ip: req.ip || "127.0.0.1"
    });

    return res.status(201).json({
      success: true,
      message: "Lead captured successfully",
      leadId: lead._id,
      assignedAgentId
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /leads/:id
export async function updateLead(req, res) {
  const { id } = req.params;
  const { name, phone, email, location, serviceInterest, source, priority, status, notes, assignedToId } = req.body;

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });

    if (name) lead.name = name;
    if (phone) lead.phone = phone;
    if (email !== undefined) lead.email = email;
    if (location !== undefined) lead.location = location;
    if (serviceInterest) lead.serviceInterest = serviceInterest;
    if (source) lead.source = mapLeadSource(String(source));
    if (priority) lead.priority = priority;
    if (status) lead.status = mapLeadStatus(String(status));
    if (notes !== undefined) lead.notes = notes;
    if (assignedToId !== undefined) lead.assignedToId = assignedToId || null;

    await lead.save();

    const companyId = lead.companyId || req.user?.companyId;
    try {
      if (companyId) {
        broadcastToCompany(companyId, "lead_updated", {
          id: lead._id,
          name: lead.name,
          status: mapLeadStatusToFrontend(lead.status),
          priority: lead.priority,
          assignedToId: lead.assignedToId
        });
        emitLeadEvent(companyId, "lead_updated", lead);
      }
    } catch (err) { }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: {
        id: lead._id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        priority: lead.priority,
        status: mapLeadStatusToFrontend(lead.status),
        assignedToId: lead.assignedToId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /leads/:id/priority
export async function updateLeadPriority(req, res) {
  const { id } = req.params;
  const { priority } = req.body;

  if (!priority) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Priority value is required" } });

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });

    lead.priority = priority;
    await lead.save();

    const companyId = lead.companyId || req.user?.companyId;
    try {
      if (companyId) {
        broadcastToCompany(companyId, "lead_updated", {
          id: lead._id,
          priority: lead.priority
        });
        emitLeadEvent(companyId, "lead_updated", lead);
      }
    } catch (err) { }

    return res.status(200).json({
      success: true,
      data: { id: lead._id, priority: lead.priority }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /leads/:id/status
export async function updateLeadStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status value is required" } });

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });

    lead.status = mapLeadStatus(String(status));
    await lead.save();

    const companyId = lead.companyId || req.user?.companyId;
    try {
      if (companyId) {
        broadcastToCompany(companyId, "lead_updated", {
          id: lead._id,
          status: mapLeadStatusToFrontend(lead.status)
        });
        emitLeadEvent(companyId, "lead_updated", lead);
      }
    } catch (err) { }
    return res.status(200).json({
      success: true,
      data: { id: lead._id, status: mapLeadStatusToFrontend(lead.status) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /leads/:id/notes
export async function updateLeadNotes(req, res) {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });

    lead.notes = notes;
    await lead.save();

    return res.status(200).json({
      success: true,
      data: { id: lead._id, notes: lead.notes }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /leads/:id/followup
export async function updateLeadFollowUp(req, res) {
  const { id } = req.params;
  const { date } = req.body;

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });

    lead.followUpDate = date ? new Date(date) : null;
    await lead.save();

    return res.status(200).json({
      success: true,
      data: { id: lead._id, followUpDate: lead.followUpDate }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /leads/:id/assign
export async function assignLead(req, res) {
  const { id } = req.params;
  const { agentId } = req.body;

  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });

    let agent = null;
    if (agentId) {
      agent = await User.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Agent not found" } });
      }
    }

    lead.assignedToId = agentId || null;
    await lead.save();

    if (agentId && agent) {
      await AgentProfile.findOneAndUpdate({ userId: agentId }, { $inc: { leadsCount: 1 } }).catch(() => { });

      const companyId = lead.companyId || req.user?.companyId;
      if (companyId) {
        try {
          const notif = await Notification.create({
            companyId,
            userId: agentId,
            type: "LEAD_ASSIGNED",
            title: "⚡ Lead Assigned to You",
            message: `You have been assigned to lead "${lead.name}" (${lead.serviceInterest})`,
            link: "/admin/leads"
          });
          emitNotificationCreated(companyId, agentId, notif);
          emitLeadEvent(companyId, "lead_assigned", lead);
          broadcastToCompany(companyId, "lead_updated", { id: lead._id, assignedToId: agentId });
        } catch (nErr) { }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        id: lead._id,
        assignedToId: lead.assignedToId,
        assignedTo: agent ? agent.name : "Unassigned"
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// GET /api/leads/:id
export async function getLeadById(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;

  try {
    const lead = await Lead.findOne({ _id: id, companyId });
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found" } });
    }

    const [customer, deals, assignedTo, thread, appointments, activities] = await Promise.all([
      Customer.findOne({ leadId: id }),
      Deal.find({ leadId: id }),
      lead.assignedToId ? User.findById(lead.assignedToId).select("name email") : null,
      ChatThread.findOne({ leadId: id }),
      Appointment.find({ leadId: id }),
      Activity.find({ leadId: id }).sort({ createdAt: -1 })
    ]);

    let messages = [];
    if (thread) {
      messages = await Message.find({ threadId: thread._id }).sort({ timestamp: -1 }).limit(10);
    }

    const leadObj = lead.toObject();
    leadObj.customer = customer;
    leadObj.deals = deals;
    leadObj.assignedTo = assignedTo;
    leadObj.chatThread = thread ? { ...thread.toObject(), messages } : null;
    leadObj.appointments = appointments;
    leadObj.activities = activities;

    return res.status(200).json({ success: true, data: leadObj });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// POST /api/leads/:id/convert
export async function convertLead(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { dealTitle, dealValue = 0, dealProbability = 50, dealStage = "QUALIFICATION", companyName, notes } = req.body;

  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID is missing" } });
  }

  try {
    const lead = await Lead.findOne({ _id: id, companyId });
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Lead not found in this workspace" } });
    }

    if (!dealTitle || !String(dealTitle).trim()) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Deal Title is required." } });
    }
    if (!companyName || !String(companyName).trim()) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Company Account Name is required." } });
    }
    if (dealValue === undefined || dealValue === null || isNaN(Number(dealValue)) || Number(dealValue) < 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Deal Value must be a valid number greater than or equal to $0." } });
    }
    if (dealProbability === undefined || dealProbability === null || isNaN(Number(dealProbability)) || Number(dealProbability) < 0 || Number(dealProbability) > 100) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Probability must be between 0% and 100%." } });
    }

    const existingCustomer = await Customer.findOne({ leadId: id });
    if (lead.status === "Converted" || existingCustomer) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_CONVERSION",
          message: "This lead has already been converted into a Customer account and Deal."
        }
      });
    }

    const val = Math.max(0, Number(dealValue) || 0);
    const prob = Math.min(100, Math.max(0, Number(dealProbability) || 50));
    const expectedRevenue = (val * prob) / 100;
    const title = dealTitle && String(dealTitle).trim() ? String(dealTitle).trim() : `Deal - ${lead.name}`;

    const customer = await Customer.create({
      companyId,
      leadId: lead._id,
      name: lead.name,
      email: lead.email || null,
      phone: lead.phone,
      companyName: companyName ? String(companyName).trim() : lead.name,
      notes: notes || lead.notes || null
    });

    const deal = await Deal.create({
      companyId,
      customerId: customer._id,
      leadId: lead._id,
      assignedAgentId: lead.assignedToId || req.user?.id || null,
      title,
      dealValue: val,
      probability: prob,
      expectedRevenue,
      stage: dealStage ? String(dealStage).charAt(0).toUpperCase() + String(dealStage).slice(1).toLowerCase() : "Qualification",
      notes: notes || null
    });

    const updatedLead = await Lead.findByIdAndUpdate(lead._id, { status: "Converted" }, { new: true });

    const activity = await Activity.create({
      companyId,
      leadId: lead._id,
      customerId: customer._id,
      dealId: deal._id,
      userId: req.user?.id,
      type: "LEAD_CONVERTED",
      description: `Converted Lead "${lead.name}" to Customer "${customer.name}" and created Deal "${deal.title}" ($${deal.dealValue})`,
      metadata: { customerId: customer._id, dealId: deal._id, dealValue: deal.dealValue }
    });

    await AuditLog.create({
      category: "Tenants",
      event: `Lead "${lead.name}" converted to Customer (${customer._id}) and Deal (${deal._id}) by ${req.user?.email || "System"}`,
      user: req.user?.email || "System",
      ip: req.ip || "127.0.0.1"
    });

    const result = { customer, deal, lead: updatedLead, activity };

    try {
      const notifTargetUser = lead.assignedToId || req.user?.id;
      if (notifTargetUser && companyId) {
        const notif = await Notification.create({
          companyId,
          userId: notifTargetUser,
          type: "LEAD_CONVERTED",
          title: "🎉 Lead Converted to Customer",
          message: `Lead "${lead.name}" was converted to Customer "${customer.name}" and Deal "${deal.title}" ($${deal.dealValue.toLocaleString()})`,
          link: "/admin/deals"
        });
        emitNotificationCreated(companyId, notifTargetUser, notif);
      }
      broadcastToCompany(companyId, "lead_converted", result);
    } catch (e) { }

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// GET /api/leads/export
export async function exportLeadsCSV(req, res) {
  let companyId = req.user?.companyId || "company-infotattva-id";
  try {
    const leadCount = await Lead.countDocuments({ companyId });
    if (leadCount === 0) {
      const firstLead = await Lead.findOne({});
      if (firstLead) companyId = firstLead.companyId;
    }

    const leads = await Lead.find({ companyId }).sort({ createdAt: -1 });
    let csv = "ID,Name,Phone,Email,Location,Service Interest,Source,Priority,Status,Created At\n";
    leads.forEach((l) => {
      csv += `"${l._id}","${l.name || ""}","${l.phone || ""}","${l.email || ""}","${l.location || ""}","${l.serviceInterest || ""}","${l.source || ""}","${l.priority || "Medium"}","${l.status || ""}","${l.createdAt ? l.createdAt.toISOString() : ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="leads_export_${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/leads/import (Import CSV / Excel Rows)
export async function importLeadsCSV(req, res) {
  let companyId = req.user?.companyId || "company-infotattva-id";
  const { items, csvText } = req.body;

  try {
    let leadsToInsert = [];

    if (Array.isArray(items) && items.length > 0) {
      leadsToInsert = items.map((item) => ({
        companyId,
        name: item.name || item.Name || "Imported Lead",
        phone: item.phone || item.Phone || "+91 90000 00000",
        email: item.email || item.Email || "",
        location: item.location || item.Location || "N/A",
        serviceInterest: item.serviceInterest || item.ServiceInterest || item["Service Interest"] || "General Inquiry",
        source: mapLeadSource(item.source || item.Source || "Manual Entry"),
        priority: item.priority || item.Priority || "Medium",
        status: mapLeadStatus(item.status || item.Status || "New"),
        notes: item.notes || item.Notes || "Imported via CSV Data Import"
      }));
    } else if (typeof csvText === "string" && csvText.trim().length > 0) {
      const lines = csvText.trim().split("\n");
      if (lines.length > 1) {
        const headers = lines[0].split(",").map((h) => h.replace(/["\r]/g, "").trim());
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.replace(/["\r]/g, "").trim());
          if (values.length >= 2 && values[0]) {
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = values[idx] || "";
            });
            leadsToInsert.push({
              companyId,
              name: rowObj["Name"] || rowObj["name"] || values[0] || "Imported Lead",
              phone: rowObj["Phone"] || rowObj["phone"] || values[1] || "+91 90000 00000",
              email: rowObj["Email"] || rowObj["email"] || values[2] || "",
              location: rowObj["Location"] || rowObj["location"] || values[3] || "N/A",
              serviceInterest: rowObj["Service Interest"] || rowObj["serviceInterest"] || values[4] || "General Inquiry",
              source: mapLeadSource(rowObj["Source"] || rowObj["source"] || "Manual Entry"),
              priority: rowObj["Priority"] || rowObj["priority"] || "Medium",
              status: mapLeadStatus(rowObj["Status"] || rowObj["status"] || "New"),
              notes: rowObj["Notes"] || rowObj["notes"] || "Imported via CSV Data Import"
            });
          }
        }
      }
    }

    if (leadsToInsert.length === 0) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "No valid lead rows found to import." } });
    }

    const createdLeads = await Lead.insertMany(leadsToInsert);

    try {
      broadcastToCompany(companyId, "lead_created", { count: createdLeads.length });
    } catch (e) { }

    return res.status(201).json({
      success: true,
      message: `🎉 Successfully imported ${createdLeads.length} leads!`,
      data: { count: createdLeads.length, imported: createdLeads }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}
