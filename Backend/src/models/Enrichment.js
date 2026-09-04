import mongoose from "mongoose";
import { randomUUID } from "crypto";

const leadBatchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    niche: { type: String, required: true },
    region: { type: String, required: true },
    platform: { type: String, required: true },
    count: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
leadBatchSchema.virtual("id").get(function () { return this._id; });

const enrichmentBatchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    leadBatchId: { type: String, ref: "LeadBatch" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
enrichmentBatchSchema.virtual("id").get(function () { return this._id; });

const contactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    enrichmentBatchId: { type: String, ref: "EnrichmentBatch", required: true, index: true },
    businessName: { type: String },
    websiteUrl: { type: String },
    name: { type: String },
    role: { type: String },
    email: { type: String },
    phone: { type: String },
    whatsapp: { type: String },
    linkedin: { type: String },
    socialProfiles: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
contactSchema.virtual("id").get(function () { return this._id; });

const emailValidationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    email: { type: String, required: true },
    syntaxValid: { type: Boolean, default: false },
    mxCheck: { type: Boolean, default: false },
    smtpValid: { type: Boolean, default: false },
    disposable: { type: Boolean, default: false },
    duplicate: { type: Boolean, default: false },
    catchAll: { type: Boolean, default: false },
    status: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
emailValidationSchema.virtual("id").get(function () { return this._id; });

const outreachDraftSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    contactId: { type: String, ref: "Contact" },
    mode: { type: String, required: true },
    channel: { type: String, required: true },
    content: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
outreachDraftSchema.virtual("id").get(function () { return this._id; });

export const LeadBatch = mongoose.models.LeadBatch || mongoose.model("LeadBatch", leadBatchSchema);
export const EnrichmentBatch = mongoose.models.EnrichmentBatch || mongoose.model("EnrichmentBatch", enrichmentBatchSchema);
export const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export const EmailValidation = mongoose.models.EmailValidation || mongoose.model("EmailValidation", emailValidationSchema);
export const OutreachDraft = mongoose.models.OutreachDraft || mongoose.model("OutreachDraft", outreachDraftSchema);

export default EnrichmentBatch;
