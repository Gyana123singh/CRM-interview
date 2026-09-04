import { Notification } from "../models/index.js";

// GET /api/notifications
export async function getNotifications(req, res) {
  const companyId = req.user?.companyId;
  const userId = req.user?.id;
  if (!companyId || !userId) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User session missing" } });
  }

  try {
    const [unreadCount, notifications] = await Promise.all([
      Notification.countDocuments({ companyId, userId, isRead: false }),
      Notification.find({ companyId, userId }).sort({ createdAt: -1 }).limit(30)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        unreadCount,
        notifications
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /api/notifications/:id/read
export async function markNotificationAsRead(req, res) {
  const companyId = req.user?.companyId;
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: id, companyId, userId },
      { isRead: true },
      { new: true }
    );
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}

// PATCH /api/notifications/read-all
export async function markAllNotificationsAsRead(req, res) {
  const companyId = req.user?.companyId;
  const userId = req.user?.id;

  try {
    await Notification.updateMany({ companyId, userId, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
}
