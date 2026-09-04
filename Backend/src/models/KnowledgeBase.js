import mongoose from "mongoose";
import { randomUUID } from "crypto";

const knowledgeBaseSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String },
    category: { type: String, required: true },
    fileUrl: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

knowledgeBaseSchema.virtual("id").get(function () {
  return this._id;
});

const whatsAppTemplateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["utility", "marketing", "authentication"], default: "marketing" },
    language: { type: String, default: "en_US" },
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" },
    bodyText: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

whatsAppTemplateSchema.virtual("id").get(function () {
  return this._id;
});

export const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model("KnowledgeBase", knowledgeBaseSchema);
export const WhatsAppTemplate = mongoose.models.WhatsAppTemplate || mongoose.model("WhatsAppTemplate", whatsAppTemplateSchema);

export default KnowledgeBase;
