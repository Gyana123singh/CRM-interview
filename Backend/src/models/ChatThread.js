import mongoose from "mongoose";
import { randomUUID } from "crypto";

const chatThreadSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    leadId: { type: String, ref: "Lead", required: true, unique: true },
    aiAutoReply: { type: Boolean, default: true },
    status: { type: String, default: "active" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
    toObject: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; delete ret.__v; return ret; } }
  }
);

chatThreadSchema.virtual("id").get(function () {
  return this._id;
});

chatThreadSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "threadId"
});

export const ChatThread = mongoose.models.ChatThread || mongoose.model("ChatThread", chatThreadSchema);
export default ChatThread;
