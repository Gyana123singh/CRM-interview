import mongoose from "mongoose";
import { randomUUID } from "crypto";

const activitySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    leadId: { type: String, ref: "Lead", index: true },
    customerId: { type: String, ref: "Customer" },
    dealId: { type: String, ref: "Deal", index: true },
    userId: { type: String, ref: "User" },
    assignedToId: { type: String, ref: "User", index: true },
    type: { type: String, required: true }, // e.g. 'CALL', 'EMAIL', 'MEETING', 'DEMO', 'REMINDER', 'LEAD_CREATED', 'LEAD_CONVERTED', etc.
    activityType: {
      type: String,
      enum: ["Call", "Email", "Meeting", "Demo", "Reminder", "Note", "Timeline", "System"],
      default: "Timeline"
    },
    title: { type: String },
    description: { type: String, required: true },
    dueDate: { type: Date, index: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Overdue"],
      default: "Pending",
      index: true
    },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

activitySchema.virtual("id").get(function () {
  return this._id;
});

activitySchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true
});

activitySchema.virtual("assignedTo", {
  ref: "User",
  localField: "assignedToId",
  foreignField: "_id",
  justOne: true
});

export const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);
export default Activity;
