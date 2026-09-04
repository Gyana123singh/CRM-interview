import mongoose from "mongoose";
import { randomUUID } from "crypto";

const automationRuleSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    trigger: {
      type: String,
      enum: ["New Lead Created", "Status Updated", "No Customer Response"],
      required: true
    },
    condition: { type: String },
    actions: [{ type: String }],
    delay: { type: String, default: "Instant" },
    status: { type: String, enum: ["active", "paused"], default: "active" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

automationRuleSchema.virtual("id").get(function () {
  return this._id;
});

export const AutomationRule = mongoose.models.AutomationRule || mongoose.model("AutomationRule", automationRuleSchema);
export default AutomationRule;
