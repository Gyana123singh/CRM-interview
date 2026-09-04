import { Activity, Notification, Lead, Deal, Customer, User } from "../models/index.js";
import { emitActivityEvent, emitNotificationCreated } from "../services/socketEvents.js";

// GET /api/activities
export async function getActivities(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID missing" } });
  }

  const { leadId, dealId, customerId, status, activityType, page = "1", limit = "30" } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 30));
  const skip = (pageNum - 1) * limitNum;

  try {
    const where = { companyId };
    if (leadId) where.leadId = String(leadId);
    if (dealId) where.dealId = String(dealId);
    if (customerId) where.customerId = String(customerId);
    if (activityType && activityType !== "ALL") where.activityType = String(activityType);

    const now = new Date();

    const [total, rawItems] = await Promise.all([
      Activity.countDocuments(where),
      Activity.find(where)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    const items = await Promise.all(rawItems.map(async (act) => {
      const obj = act.toObject();
      
      // Auto compute Overdue status if past due date and still Pending
      if (obj.status === "Pending" && obj.dueDate && new Date(obj.dueDate) < now) {
        obj.status = "Overdue";
      }

      if (obj.userId) {
        obj.user = await User.findById(obj.userId).select("name email");
      }
      if (obj.assignedToId) {
        obj.assignedTo = await User.findById(obj.assignedToId).select("name email");
      }
      return obj;
    }));

    if (status && status !== "ALL") {
      const filtered = items.filter(i => i.status === status);
      return res.status(200).json({
        success: true,
        data: {
          items: filtered,
          pagination: { page: pageNum, limit: limitNum, total: filtered.length, totalPages: Math.ceil(filtered.length / limitNum) }
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// POST /api/activities
export async function createActivity(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Tenant Company ID missing" } });
  }

  const { leadId, dealId, customerId, activityType = "Call", title, description, dueDate, assignedToId } = req.body;

  if (!description || !String(description).trim()) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Description is required" } });
  }

  try {
    const targetAssignedId = assignedToId || req.user?.id;

    const activity = await Activity.create({
      companyId,
      leadId: leadId || null,
      dealId: dealId || null,
      customerId: customerId || null,
      userId: req.user?.id,
      assignedToId: targetAssignedId,
      type: "FOLLOW_UP",
      activityType,
      title: title ? String(title).trim() : `${activityType} Follow-up`,
      description: String(description).trim(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000), // Default tomorrow
      status: "Pending"
    });

    if (targetAssignedId) {
      const notif = await Notification.create({
        companyId,
        userId: targetAssignedId,
        type: "UPCOMING_FOLLOWUP",
        title: `New ${activityType} Activity Scheduled`,
        message: `${activity.title}: ${activity.description}`,
        link: leadId ? `/admin/leads` : dealId ? `/admin/deals` : `/admin/dashboard`
      });
      emitNotificationCreated(companyId, targetAssignedId, notif);
    }

    emitActivityEvent(companyId, "activity_created", activity);

    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /api/activities/:id/status
export async function updateActivityStatus(req, res) {
  const companyId = req.user?.companyId;
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Pending", "Completed"].includes(status)) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Valid status (Pending, Completed) required" } });
  }

  try {
    const updated = await Activity.findOneAndUpdate(
      { _id: id, companyId },
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Activity not found" } });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}
