import mongoose from "mongoose";
import { randomUUID } from "crypto";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "sales-manager", "sales-executive", "team"], required: true },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    companyId: { type: String, ref: "Company" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

userSchema.virtual("id").get(function () {
  return this._id;
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
