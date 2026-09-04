import mongoose from "mongoose";
import { randomUUID } from "crypto";

const leadSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    location: { type: String },
    serviceInterest: { type: String, required: true },
    message: { type: String },
    source: {
      type: String,
      enum: ["Website", "Referral", "Social Media", "Email", "Phone", "Website Forms", "Landing Pages", "Meta Ads", "Google Ads", "WhatsApp", "Manual Entry"],
      default: "Website",
      index: true
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Unqualified/Lost", "Interested", "Follow-up", "Converted", "Lost", "Not Reachable"],
      default: "New",
      index: true
    },
    isConverted: { type: Boolean, default: false, index: true },
    customerId: { type: String, ref: "Customer" },
    dealId: { type: String, ref: "Deal" },
    followUpDate: { type: Date },
    notes: { type: String },
    cms: { type: String },
    leadBatchId: { type: String, ref: "LeadBatch" },
    assignedToId: { type: String, ref: "User", index: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

leadSchema.virtual("id").get(function () {
  return this._id;
});

leadSchema.virtual("assignedTo", {
  ref: "User",
  localField: "assignedToId",
  foreignField: "_id",
  justOne: true
});

leadSchema.virtual("company", {
  ref: "Company",
  localField: "companyId",
  foreignField: "_id",
  justOne: true
});

export const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default Lead;
