import mongoose from "mongoose";
import { randomUUID } from "crypto";

const seoAuditSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    url: { type: String, required: true },
    ssl: { type: Boolean, default: false },
    https: { type: Boolean, default: false },
    mobileResponsive: { type: Boolean, default: false },
    contactInfo: { type: mongoose.Schema.Types.Mixed },
    ctaPresence: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    headings: { type: mongoose.Schema.Types.Mixed },
    robotsTxt: { type: Boolean, default: false },
    sitemapXml: { type: Boolean, default: false },
    canonicalTags: { type: Boolean, default: false },
    indexability: { type: Boolean, default: false },
    imageAltTags: { type: mongoose.Schema.Types.Mixed },
    localSEO: { type: mongoose.Schema.Types.Mixed },
    executiveSummary: { type: String },
    priorityActions: { type: mongoose.Schema.Types.Mixed },
    criticalFindings: { type: mongoose.Schema.Types.Mixed },
    highFindings: { type: mongoose.Schema.Types.Mixed },
    mediumFindings: { type: mongoose.Schema.Types.Mixed },
    goodFindings: { type: mongoose.Schema.Types.Mixed },
    quickWins: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
seoAuditSchema.virtual("id").get(function () { return this._id; });

const socialAuditSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    platform: { type: String, required: true },
    profileUrl: { type: String, required: true },
    accountType: { type: String, required: true },
    screenshotUrl: { type: String },
    profileScore: { type: Number, default: 0 },
    brandingAnalysis: { type: String },
    engagementAnalysis: { type: String },
    growthOpportunities: { type: mongoose.Schema.Types.Mixed },
    recommendations: { type: mongoose.Schema.Types.Mixed },
    contentPlan: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
socialAuditSchema.virtual("id").get(function () { return this._id; });

const googleBusinessAuditSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    listingUrl: { type: String, required: true },
    profileExistence: { type: Boolean, default: false },
    completeness: { type: Number, default: 0 },
    reviews: { type: mongoose.Schema.Types.Mixed },
    ratings: { type: Number, default: 0.0 },
    localVisibility: { type: Number, default: 0 },
    localSEOReadiness: { type: Number, default: 0 },
    recommendations: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
googleBusinessAuditSchema.virtual("id").get(function () { return this._id; });

const auditSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    type: { type: String, required: true },
    target: { type: String, required: true },
    score: { type: Number, default: 0 },
    status: { type: String, default: "completed" },
    pdfUrl: { type: String },
    seoAuditId: { type: String, ref: "SeoAudit" },
    socialAuditId: { type: String, ref: "SocialAudit" },
    googleBusinessAuditId: { type: String, ref: "GoogleBusinessAudit" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
auditSchema.virtual("id").get(function () { return this._id; });

export const SeoAudit = mongoose.models.SeoAudit || mongoose.model("SeoAudit", seoAuditSchema);
export const SocialAudit = mongoose.models.SocialAudit || mongoose.model("SocialAudit", socialAuditSchema);
export const GoogleBusinessAudit = mongoose.models.GoogleBusinessAudit || mongoose.model("GoogleBusinessAudit", googleBusinessAuditSchema);
export const Audit = mongoose.models.Audit || mongoose.model("Audit", auditSchema);

export default Audit;
