import mongoose from "mongoose";
import { randomUUID } from "crypto";

const messageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    threadId: { type: String, ref: "ChatThread", required: true, index: true },
    sender: { type: String, enum: ["customer", "agent", "bot"], required: true },
    text: { type: String, required: true },
    aiResponse: { type: String },
    channel: { type: String, enum: ["WhatsApp", "Web", "SMS"], default: "WhatsApp" },
    timestamp: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

messageSchema.virtual("id").get(function () {
  return this._id;
});

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
