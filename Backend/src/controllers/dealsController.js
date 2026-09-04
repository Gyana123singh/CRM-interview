import { Deal, Activity, Notification, AuditLog, Customer, Lead, User } from "../models/index.js";
import { broadcastToCompany } from "../utils/sse.js";
import { emitDealEvent, emitNotificationCreated } from "../services/socketEvents.js";

const VALID_STAGES = ["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

// GET /api/deals
export async function getDeals(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID is missing" } });
  }

  const { page = "1", limit = "20", search, stage, assignedAgentId, sortBy = "createdAt", sortOrder = "desc" } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = { companyId };

    if (stage && stage !== "ALL") {
      where.stage = new RegExp(`^${stage}$`, "i");
    }
    if (assignedAgentId && assignedAgentId !== "ALL") {
      where.assignedAgentId = String(assignedAgentId);
    }
    if (search) {
      where.title = new RegExp(String(search), "i");
    }

    const sortObj = { [String(sortBy)]: String(sortOrder).toLowerCase() === "asc" ? 1 : -1 };

    const [total, items] = await Promise.all([
      Deal.countDocuments(where),
      Deal.find(where)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
    ]);

    const populatedItems = await Promise.all(items.map(async (d) => {
      const [cust, lead, agent] = await Promise.all([
        d.customerId ? Customer.findById(d.customerId).select("name email phone") : null,
        d.leadId ? Lead.findById(d.leadId).select("name email phone") : null,
        d.assignedAgentId ? User.findById(d.assignedAgentId).select("name email") : null
      ]);
      const obj = d.toObject();
      obj.customer = cust;
      obj.lead = lead;
      obj.assignedAgent = agent;
      return obj;
    }));

    return res.status(200).json({
      success: true,
      data: {
        items: populatedItems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// GET /api/deals/:id
export async function getDealById(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;

  try {
    const deal = await Deal.findOne({ _id: id, companyId });
    if (!deal) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Deal not found" } });
    }

    const [customer, lead, assignedAgent, activities] = await Promise.all([
      deal.customerId ? Customer.findById(deal.customerId) : null,
      deal.leadId ? Lead.findById(deal.leadId) : null,
      deal.assignedAgentId ? User.findById(deal.assignedAgentId).select("name email") : null,
      Activity.find({ dealId: id }).sort({ createdAt: -1 })
    ]);

    const dealObj = deal.toObject();
    dealObj.customer = customer;
    dealObj.lead = lead;
    dealObj.assignedAgent = assignedAgent;
    dealObj.activities = activities;

    return res.status(200).json({ success: true, data: dealObj });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// POST /api/deals
export async function createDeal(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID is missing" } });
  }

  const { title, dealValue = 0, probability, stage = "QUALIFICATION", customerId, leadId, assignedAgentId, expectedClosingDate, notes } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Deal title is required" } });
  }

  const numericValue = Number(dealValue);
  if (isNaN(numericValue) || numericValue < 0) {
    return res.status(422).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Deal value must be a non-negative number" } });
  }

  const stageUpper = String(stage).toUpperCase();
  if (!VALID_STAGES.includes(stageUpper)) {
    return res.status(422).json({ success: false, error: { code: "VALIDATION_ERROR", message: `Invalid deal stage. Allowed: ${VALID_STAGES.join(", ")}` } });
  }

  let numericProb = probability !== undefined && probability !== null ? Number(probability) : undefined;
  if (numericProb === undefined || isNaN(numericProb)) {
    if (stageUpper === "WON") numericProb = 100;
    else if (stageUpper === "LOST") numericProb = 0;
    else if (stageUpper === "QUALIFICATION") numericProb = 20;
    else if (stageUpper === "DISCOVERY") numericProb = 40;
    else if (stageUpper === "PROPOSAL") numericProb = 60;
    else if (stageUpper === "NEGOTIATION") numericProb = 80;
    else numericProb = 50;
  }

  if (numericProb < 0 || numericProb > 100) {
    return res.status(422).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Probability must be between 0 and 100" } });
  }

  const formattedStage = String(stage).charAt(0).toUpperCase() + String(stage).slice(1).toLowerCase();
  const expectedRevenue = Math.round(((numericValue * numericProb) / 100) * 100) / 100;

  try {
    const created = await Deal.create({
      companyId,
      title: title.trim(),
      dealValue: numericValue,
      probability: numericProb,
      expectedRevenue,
      stage: formattedStage,
      customerId: customerId || null,
      leadId: leadId || null,
      assignedAgentId: assignedAgentId || req.user?.id || null,
      expectedClosingDate: expectedClosingDate ? new Date(expectedClosingDate) : null,
      notes: notes || null,
      closedAt: stageUpper === "WON" || stageUpper === "LOST" ? new Date() : null
    });

    await Activity.create({
      companyId,
      dealId: created._id,
      leadId: created.leadId,
      customerId: created.customerId,
      userId: req.user?.id,
      type: "DEAL_CREATED",
      description: `Created deal "${created.title}" with value ${created.dealValue} and expected revenue ${created.expectedRevenue}`,
      metadata: { initialStage: created.stage, dealValue: created.dealValue }
    });

    await AuditLog.create({
      category: "Tenants",
      event: `Deal "${created.title}" created by ${req.user?.email || "user"}`,
      user: req.user?.email || "System",
      ip: req.ip || "127.0.0.1"
    });

    try {
      broadcastToCompany(companyId, "deal_created", created);
    } catch (e) {}

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /api/deals/:id/stage
export async function updateDealStage(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { stage, lossReason, reopen } = req.body;

  if (!stage) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Stage is required" } });
  }

  const nextStageUpper = String(stage).toUpperCase();
  if (!VALID_STAGES.includes(nextStageUpper)) {
    return res.status(422).json({ success: false, error: { code: "VALIDATION_ERROR", message: `Invalid stage. Allowed: ${VALID_STAGES.join(", ")}` } });
  }

  const nextStage = String(stage).charAt(0).toUpperCase() + String(stage).slice(1).toLowerCase();

  try {
    const existingDeal = await Deal.findOne({ _id: id, companyId });
    if (!existingDeal) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Deal not found" } });
    }

    if (nextStageUpper === "LOST" && (!lossReason || !String(lossReason).trim())) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "A loss reason is strictly required when setting a deal to LOST."
        }
      });
    }

    let defaultProb = existingDeal.probability;
    if (nextStageUpper === "WON") defaultProb = 100;
    if (nextStageUpper === "LOST") defaultProb = 0;
    if (nextStageUpper === "QUALIFICATION") defaultProb = 20;
    if (nextStageUpper === "DISCOVERY") defaultProb = 40;
    if (nextStageUpper === "PROPOSAL") defaultProb = 60;
    if (nextStageUpper === "NEGOTIATION") defaultProb = 80;

    const expectedRevenue = (existingDeal.dealValue * defaultProb) / 100;
    const closedAt = nextStageUpper === "WON" || nextStageUpper === "LOST" ? new Date() : null;

    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      {
        stage: nextStage,
        probability: defaultProb,
        expectedRevenue,
        lossReason: nextStageUpper === "LOST" ? String(lossReason).trim() : null,
        closedAt
      },
      { new: true }
    );

    await Activity.create({
      companyId: companyId,
      dealId: updatedDeal._id,
      leadId: updatedDeal.leadId,
      customerId: updatedDeal.customerId,
      userId: req.user?.id,
      type: "DEAL_STAGE_CHANGED",
      description: `Stage changed from ${existingDeal.stage} to ${nextStage}`,
      metadata: {
        fromStage: existingDeal.stage,
        toStage: nextStage,
        lossReason: updatedDeal.lossReason,
        expectedRevenue: updatedDeal.expectedRevenue
      }
    });

    await AuditLog.create({
      category: "Tenants",
      event: `Deal "${updatedDeal.title}" stage changed from ${existingDeal.stage} to ${nextStage}`,
      user: req.user?.email || "System",
      ip: req.ip || "127.0.0.1"
    });

    try {
      broadcastToCompany(companyId, "deal_updated", updatedDeal);
      emitDealEvent(companyId, "deal_stage_changed", updatedDeal);

      if (nextStageUpper === "WON" || nextStageUpper === "LOST") {
        const notif = await Notification.create({
          companyId,
          userId: updatedDeal.assignedAgentId || req.user?.id,
          type: "DEAL_CLOSED",
          title: `Deal ${nextStageUpper}: "${updatedDeal.title}"`,
          message: `Deal "${updatedDeal.title}" was marked as ${nextStageUpper} ($${updatedDeal.dealValue.toLocaleString()})`,
          link: "/admin/deals"
        });
        emitNotificationCreated(companyId, updatedDeal.assignedAgentId || req.user?.id, notif);
      }
    } catch (e) {}

    return res.status(200).json({ success: true, data: updatedDeal });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /api/deals/:id
export async function updateDeal(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { title, dealValue, probability, notes, assignedAgentId } = req.body;

  try {
    const existing = await Deal.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Deal not found" } });
    }

    const val = dealValue !== undefined ? Number(dealValue) : existing.dealValue;
    const prob = probability !== undefined ? Number(probability) : existing.probability;

    if (val < 0) {
      return res.status(422).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Deal value must be >= 0" } });
    }
    if (prob < 0 || prob > 100) {
      return res.status(422).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Probability must be 0-100" } });
    }

    const expectedRevenue = (val * prob) / 100;

    const updated = await Deal.findByIdAndUpdate(
      id,
      {
        title: title ? String(title).trim() : existing.title,
        dealValue: val,
        probability: prob,
        expectedRevenue,
        notes: notes !== undefined ? notes : existing.notes,
        assignedAgentId: assignedAgentId !== undefined ? assignedAgentId : existing.assignedAgentId
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// DELETE /api/deals/:id
export async function deleteDeal(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;

  try {
    const existing = await Deal.findOne({ _id: id, companyId });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Deal not found" } });
    }

    await Deal.findByIdAndDelete(id);

    await AuditLog.create({
      category: "Tenants",
      event: `Deal "${existing.title}" deleted by ${req.user?.email}`,
      user: req.user?.email || "System",
      ip: req.ip || "127.0.0.1"
    });

    return res.status(200).json({ success: true, data: { message: "Deal deleted successfully" } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// GET /api/deals/export
export async function exportDealsCSV(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const deals = await Deal.find({ companyId }).sort({ createdAt: -1 });
    let csv = "ID,Title,Value,Probability,Expected Revenue,Stage,Loss Reason,Closed At,Created At\n";
    deals.forEach((d) => {
      csv += `"${d._id}","${d.title || ""}","${d.dealValue || 0}","${d.probability || 0}","${d.expectedRevenue || 0}","${d.stage || ""}","${d.lossReason || ""}","${d.closedAt ? d.closedAt.toISOString() : ""}","${d.createdAt ? d.createdAt.toISOString() : ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="deals_export_${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
