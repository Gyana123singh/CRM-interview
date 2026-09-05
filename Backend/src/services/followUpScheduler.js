import { Activity, Lead, Notification, User } from "../models/index.js";
import { emitNotificationCreated } from "./socketEvents.js";

const notifiedOverdueSet = new Set();
const notifiedUpcomingSet = new Set();

/**
 * Scan database for Overdue & Upcoming Follow-ups and dispatch notifications
 */
export async function checkFollowUps() {
  try {
    const now = new Date();

    // 1. Process Overdue Activities
    const overdueActivities = await Activity.find({
      status: "Pending",
      dueDate: { $lt: now }
    });

    for (const act of overdueActivities) {
      // Auto-update status to Overdue
      act.status = "Overdue";
      await act.save();

      const notifKey = `overdue_act_${act._id}`;
      if (!notifiedOverdueSet.has(notifKey)) {
        notifiedOverdueSet.add(notifKey);

        const targetUser = act.assignedToId || act.userId;
        if (targetUser && act.companyId) {
          const notif = await Notification.create({
            companyId: act.companyId,
            userId: targetUser,
            type: "OVERDUE_FOLLOWUP",
            title: `⚠️ Overdue Activity: ${act.title || "Follow-up"}`,
            message: `Activity "${act.title}" is overdue (was due ${new Date(act.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            link: act.leadId ? "/admin/leads" : act.dealId ? "/admin/deals" : "/admin/dashboard"
          }).catch(() => null);

          if (notif) {
            emitNotificationCreated(act.companyId, targetUser, notif);
          }
        }
      }
    }

    // 2. Process Overdue Lead Follow-ups
    const overdueLeads = await Lead.find({
      status: { $nin: ["Converted", "Lost"] },
      followUpDate: { $lt: now }
    });

    for (const lead of overdueLeads) {
      const notifKey = `overdue_lead_${lead._id}_${lead.followUpDate.getTime()}`;
      if (!notifiedOverdueSet.has(notifKey)) {
        notifiedOverdueSet.add(notifKey);

        const targetUser = lead.assignedToId;
        const companyId = lead.companyId;
        if (companyId) {
          const admins = await User.find({ companyId, role: { $in: ["admin", "client-admin", "sales-manager"] } });
          const targetIds = new Set(admins.map(a => String(a._id)));
          if (targetUser) targetIds.add(String(targetUser));

          for (const uid of targetIds) {
            const notif = await Notification.create({
              companyId,
              userId: uid,
              type: "OVERDUE_FOLLOWUP",
              title: `⚠️ Overdue Follow-up for Lead "${lead.name}"`,
              message: `Scheduled follow-up with lead "${lead.name}" (${lead.phone}) is overdue!`,
              link: "/admin/leads"
            }).catch(() => null);

            if (notif) {
              emitNotificationCreated(companyId, uid, notif);
            }
          }
        }
      }
    }

    // 3. Process Upcoming Activities (due in next 60 minutes)
    const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
    const upcomingActivities = await Activity.find({
      status: "Pending",
      dueDate: { $gte: now, $lte: inOneHour }
    });

    for (const act of upcomingActivities) {
      const notifKey = `upcoming_act_${act._id}`;
      if (!notifiedUpcomingSet.has(notifKey)) {
        notifiedUpcomingSet.add(notifKey);

        const targetUser = act.assignedToId || act.userId;
        if (targetUser && act.companyId) {
          const notif = await Notification.create({
            companyId: act.companyId,
            userId: targetUser,
            type: "UPCOMING_FOLLOWUP",
            title: `⏰ Upcoming Activity Reminder: ${act.title || "Follow-up"}`,
            message: `Follow-up "${act.title}" is due soon (${new Date(act.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            link: act.leadId ? "/admin/leads" : act.dealId ? "/admin/deals" : "/admin/dashboard"
          }).catch(() => null);

          if (notif) {
            emitNotificationCreated(act.companyId, targetUser, notif);
          }
        }
      }
    }
  } catch (err) {
    console.error("[Follow-up Scheduler Error]", err);
  }
}

/**
 * Initialize Follow-up Background Scheduler Interval
 */
export function initFollowUpScheduler() {
  console.log("⏰ Follow-up background scheduler initialized.");
  // Run once immediately on start
  setTimeout(checkFollowUps, 5000);
  // Run every 60 seconds
  setInterval(checkFollowUps, 60000);
}
