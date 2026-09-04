import mongoose from "mongoose";
import { randomUUID } from "crypto";

const appointmentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    leadId: { type: String, ref: "Lead" },
    companyId: { type: String, ref: "Company", required: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    notes: { type: String },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    service: { type: String, required: true },
    status: { type: String, enum: ["confirmed", "pending", "cancelled"], default: "pending" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

appointmentSchema.virtual("id").get(function () {
  return this._id;
});

const slotConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true },
    slotDate: { type: Date, required: true },
    slotTimes: [{ type: String }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

slotConfigSchema.index({ companyId: 1, slotDate: 1 }, { unique: true });
slotConfigSchema.virtual("id").get(function () {
  return this._id;
});

const serviceConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    companyId: { type: String, ref: "Company", required: true },
    name: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

serviceConfigSchema.index({ companyId: 1, name: 1 }, { unique: true });
serviceConfigSchema.virtual("id").get(function () {
  return this._id;
});

export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
export const AppointmentSlotConfig = mongoose.models.AppointmentSlotConfig || mongoose.model("AppointmentSlotConfig", slotConfigSchema);
export const AppointmentServiceConfig = mongoose.models.AppointmentServiceConfig || mongoose.model("AppointmentServiceConfig", serviceConfigSchema);

export default Appointment;
