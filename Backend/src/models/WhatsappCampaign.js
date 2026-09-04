import mongoose from "mongoose";
import { randomUUID } from "crypto";

const whatsappContactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    mobile: { type: String, required: true },
    email: { type: String },
    countryCode: { type: String, default: "91" },
    tags: [{ type: String }],
    notes: { type: String },
    status: { type: String, default: "active" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
whatsappContactSchema.index({ companyId: 1, mobile: 1 }, { unique: true });
whatsappContactSchema.virtual("id").get(function () { return this._id; });

const whatsappContactGroupSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    isDynamic: { type: Boolean, default: false },
    dynamicRules: { type: mongoose.Schema.Types.Mixed },
    contactIds: [{ type: String, ref: "WhatsappContact" }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
whatsappContactGroupSchema.virtual("id").get(function () { return this._id; });

const whatsappCampaignSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["Draft", "Scheduled", "Running", "Completed", "Failed"], default: "Draft" },
    scheduledTime: { type: Date },
    templateId: { type: String, ref: "WhatsAppTemplate", required: true },
    audienceGroupIds: [{ type: String, ref: "WhatsappContactGroup" }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
whatsappCampaignSchema.virtual("id").get(function () { return this._id; });

const whatsappMessageLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    campaignId: { type: String, ref: "WhatsappCampaign", required: true, index: true },
    contactId: { type: String, ref: "WhatsappContact", required: true, index: true },
    messageId: { type: String, sparse: true, unique: true },
    status: { type: String, enum: ["Queued", "Sent", "Delivered", "Read", "Failed"], default: "Queued" },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    failedReason: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
whatsappMessageLogSchema.virtual("id").get(function () { return this._id; });

const whatsAppAccountSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, unique: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    provider: { type: String, default: "Cloud API" },
    apiKey: { type: String },
    accessToken: { type: String },
    status: { type: String, default: "disconnected" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
whatsAppAccountSchema.virtual("id").get(function () { return this._id; });

export const WhatsappContact = mongoose.models.WhatsappContact || mongoose.model("WhatsappContact", whatsappContactSchema);
export const WhatsappContactGroup = mongoose.models.WhatsappContactGroup || mongoose.model("WhatsappContactGroup", whatsappContactGroupSchema);
export const WhatsappCampaign = mongoose.models.WhatsappCampaign || mongoose.model("WhatsappCampaign", whatsappCampaignSchema);
export const WhatsappMessageLog = mongoose.models.WhatsappMessageLog || mongoose.model("WhatsappMessageLog", whatsappMessageLogSchema);
export const WhatsAppAccount = mongoose.models.WhatsAppAccount || mongoose.model("WhatsAppAccount", whatsAppAccountSchema);

export default WhatsappCampaign;
