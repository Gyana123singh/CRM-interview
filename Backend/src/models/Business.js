import mongoose from "mongoose";
import { randomUUID } from "crypto";

const businessContactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    type: { type: String, required: true },
    value: { type: String, required: true },
    name: { type: String },
    role: { type: String },
    source: { type: String }
  },
  { timestamps: true }
);

const businessSocialLinkSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    platform: { type: String, required: true },
    url: { type: String, required: true }
  },
  { timestamps: true }
);

const businessTechnologySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    technologyId: { type: String, ref: "Technology" },
    name: { type: String },
    version: { type: String },
    confidence: { type: Number, default: 100 }
  },
  { timestamps: true }
);

const businessSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    placeId: { type: String, sparse: true, unique: true },
    name: { type: String, required: true },
    website: { type: String },
    phone: { type: String },
    address: { type: String },
    rating: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    cms: { type: String },
    contacts: [businessContactSchema],
    socialLinks: [businessSocialLinkSchema],
    technologies: [businessTechnologySchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
businessSchema.virtual("id").get(function () { return this._id; });

const technologySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String }
  },
  { timestamps: true }
);

const savedLeadSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: "User", required: true, index: true },
    businessId: { type: String, ref: "Business", required: true, index: true },
    leadListId: { type: String, ref: "LeadList" },
    notes: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
savedLeadSchema.index({ userId: 1, businessId: 1 }, { unique: true });
savedLeadSchema.virtual("id").get(function () { return this._id; });

const leadListSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    description: { type: String },
    userId: { type: String, ref: "User", required: true, index: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
leadListSchema.virtual("id").get(function () { return this._id; });

const searchHistorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    niche: { type: String, required: true },
    region: { type: String, required: true },
    platform: { type: String },
    limit: { type: Number, default: 10 },
    userId: { type: String, ref: "User" },
    resultsCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);
searchHistorySchema.virtual("id").get(function () { return this._id; });

const searchCacheSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    queryKey: { type: String, required: true, unique: true },
    results: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

const apiLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    requestBody: { type: String },
    responseBody: { type: String },
    statusCode: { type: Number, required: true },
    duration: { type: Number, required: true },
    ip: { type: String },
    userId: { type: String }
  },
  { timestamps: true }
);

const auditLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    timestamp: { type: Date, default: Date.now },
    category: { type: String, required: true },
    event: { type: String, required: true },
    user: { type: String, required: true },
    ip: { type: String, required: true }
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    invoiceNo: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    amount: { type: String, required: true },
    status: { type: String, required: true },
    plan: { type: String, required: true }
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true, index: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paymentStatus: { type: String, required: true }
  },
  { timestamps: true }
);

const systemPlanConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, required: true },
    maxChannels: { type: Number, required: true },
    maxSeats: { type: Number, required: true },
    maxTokens: { type: Number, required: true }
  },
  { timestamps: true }
);

const globalConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "singleton" },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    globalRateLimit: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export const Business = mongoose.models.Business || mongoose.model("Business", businessSchema);
export const Technology = mongoose.models.Technology || mongoose.model("Technology", technologySchema);
export const SavedLead = mongoose.models.SavedLead || mongoose.model("SavedLead", savedLeadSchema);
export const LeadList = mongoose.models.LeadList || mongoose.model("LeadList", leadListSchema);
export const SearchHistory = mongoose.models.SearchHistory || mongoose.model("SearchHistory", searchHistorySchema);
export const SearchCache = mongoose.models.SearchCache || mongoose.model("SearchCache", searchCacheSchema);
export const ApiLog = mongoose.models.ApiLog || mongoose.model("ApiLog", apiLogSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
export const SystemPlanConfig = mongoose.models.SystemPlanConfig || mongoose.model("SystemPlanConfig", systemPlanConfigSchema);
export const GlobalConfig = mongoose.models.GlobalConfig || mongoose.model("GlobalConfig", globalConfigSchema);

export default Business;
