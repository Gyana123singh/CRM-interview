import mongoose from "mongoose";
import { randomUUID } from "crypto";

const dealSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    customerId: { type: String, ref: "Customer" },
    leadId: { type: String, ref: "Lead" },
    assignedAgentId: { type: String, ref: "User", index: true },
    title: { type: String, required: true },
    dealValue: { type: Number, default: 0.0 },
    probability: { type: Number, default: 50.0 },
    expectedRevenue: { type: Number, default: 0.0 },
    stage: {
      type: String,
      enum: ["Qualification", "Discovery", "Proposal", "Negotiation", "Won", "Lost"],
      default: "Qualification",
      index: true
    },
    lossReason: { type: String },
    closedAt: { type: Date },
    expectedClosingDate: { type: Date },
    notes: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

dealSchema.virtual("id").get(function () {
  return this._id;
});

dealSchema.virtual("assignedAgent", {
  ref: "User",
  localField: "assignedAgentId",
  foreignField: "_id",
  justOne: true
});

dealSchema.virtual("customer", {
  ref: "Customer",
  localField: "customerId",
  foreignField: "_id",
  justOne: true
});

dealSchema.virtual("lead", {
  ref: "Lead",
  localField: "leadId",
  foreignField: "_id",
  justOne: true
});

export const Deal = mongoose.models.Deal || mongoose.model("Deal", dealSchema);
export default Deal;
