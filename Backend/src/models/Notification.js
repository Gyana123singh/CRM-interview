import mongoose from "mongoose";
import { randomUUID } from "crypto";

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    userId: { type: String, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["LEAD_ASSIGNED", "DEAL_ASSIGNED", "UPCOMING_FOLLOWUP", "OVERDUE_FOLLOWUP", "LEAD_CONVERTED", "DEAL_CLOSED", "SYSTEM"],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

notificationSchema.virtual("id").get(function () {
  return this._id;
});

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
