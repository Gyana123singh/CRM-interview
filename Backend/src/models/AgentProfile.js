import mongoose from "mongoose";
import { randomUUID } from "crypto";

const agentProfileSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: "User", required: true, unique: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["online", "busy", "offline"], default: "offline" },
    specialty: { type: String, default: "General Support Desk" },
    isActive: { type: Boolean, default: true },
    joinedDate: { type: Date, default: Date.now },
    leadsCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0.0 },
    fatherName: { type: String },
    address: { type: String },
    profileImage: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

agentProfileSchema.virtual("id").get(function () {
  return this._id;
});

export const AgentProfile = mongoose.models.AgentProfile || mongoose.model("AgentProfile", agentProfileSchema);
export default AgentProfile;
