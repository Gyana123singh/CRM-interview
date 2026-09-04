import mongoose from "mongoose";
import { randomUUID } from "crypto";

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    leadId: { type: String, ref: "Lead" },
    name: { type: String, required: true },
    email: { type: String, index: true },
    phone: { type: String, required: true, index: true },
    companyName: { type: String },
    assignedAgentId: { type: String, ref: "User", index: true },
    notes: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

customerSchema.virtual("id").get(function () {
  return this._id;
});

customerSchema.virtual("lead", {
  ref: "Lead",
  localField: "leadId",
  foreignField: "_id",
  justOne: true
});

customerSchema.virtual("assignedAgent", {
  ref: "User",
  localField: "assignedAgentId",
  foreignField: "_id",
  justOne: true
});

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
