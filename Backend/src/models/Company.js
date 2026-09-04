import mongoose from "mongoose";
import { randomUUID } from "crypto";

const companySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String },
    plan: { type: String, default: "Starter Plan" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    credits: { type: Number, default: 1000 },

    // Tenant Configurations
    routingPolicy: { type: String, default: "round-robin" },
    whatsappPhone: { type: String },
    whatsappName: { type: String },
    whatsappConnected: { type: Boolean, default: false },

    // Custom SMTP
    smtpHost: { type: String },
    smtpPort: { type: String },
    smtpUser: { type: String },
    smtpPass: { type: String },
    smtpEncryption: { type: String, default: "SSL/TLS" },
    smtpVerified: { type: Boolean, default: false },

    // AI Configurations
    botPersona: { type: String, default: "You are a professional, polite, and helpful AI assistant..." },
    botModel: { type: String, default: "Google Gemini 1.5 Pro" },
    botTemperature: { type: Number, default: 0.5 },
    botAutoPilot: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

companySchema.virtual("id").get(function () {
  return this._id;
});

export const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
export default Company;
