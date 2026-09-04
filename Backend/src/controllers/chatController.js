import { ChatThread, Message, Lead, WhatsAppAccount } from "../models/index.js";
import { sendMetaWhatsappMessage } from "../utils/whatsappSender.js";
import { broadcastToCompany } from "../utils/sse.js";

// GET /conversations
export async function getConversations(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  try {
    const leads = await Lead.find({ companyId });
    const leadIds = leads.map(l => l._id);

    const threads = await ChatThread.find({ leadId: { $in: leadIds } }).sort({ updatedAt: -1 });

    const formatted = await Promise.all(threads.map(async (t) => {
      const lead = leads.find(l => String(l._id) === String(t.leadId));
      const messages = await Message.find({ threadId: t._id }).sort({ timestamp: 1 });

      return {
        leadId: t.leadId,
        leadName: lead?.name || "Unknown Lead",
        phone: lead?.phone || "",
        aiAutoReply: t.aiAutoReply,
        status: t.status,
        messages: messages.map(m => ({
          id: m._id,
          sender: m.sender.toLowerCase(),
          text: m.text,
          aiResponse: m.aiResponse || null,
          timestamp: m.timestamp.toISOString(),
          channel: m.channel
        }))
      };
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /conversations (Create New Thread)
export async function createThread(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { leadId } = req.body;
  if (!leadId) return res.status(400).json({ error: "Lead ID is required" });

  try {
    const lead = await Lead.findById(leadId);
    if (!lead || String(lead.companyId) !== String(companyId)) {
      return res.status(404).json({ error: "Lead not found in this company workspace" });
    }

    let thread = await ChatThread.findOne({ leadId });
    if (!thread) {
      thread = await ChatThread.create({
        leadId,
        aiAutoReply: true,
        status: "active"
      });
    }

    return res.status(200).json({
      leadId: thread.leadId,
      leadName: lead.name,
      phone: lead.phone,
      aiAutoReply: thread.aiAutoReply,
      status: thread.status,
      messages: []
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /conversations/:leadId/messages (Send message)
export async function sendMessage(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { leadId } = req.params;
  const { text, channel } = req.body;

  if (!text) return res.status(400).json({ error: "Message text is required" });

  try {
    const thread = await ChatThread.findOne({ leadId });
    const lead = thread ? await Lead.findById(thread.leadId) : null;

    if (!thread || !lead || String(lead.companyId) !== String(companyId)) {
      return res.status(404).json({ error: "Conversation thread not found" });
    }

    const message = await Message.create({
      threadId: thread._id,
      sender: "agent",
      text,
      channel: channel || "WhatsApp"
    });

    const finalChannel = (channel || "WhatsApp").toUpperCase();
    if (finalChannel === "WHATSAPP") {
      try {
        const waAccount = await WhatsAppAccount.findOne({ companyId });

        if (waAccount && waAccount.status === "connected") {
          const token = process.env.WHATSAPP_ACCESS_TOKEN || waAccount.accessToken;
          const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || waAccount.apiKey || waAccount.phone.replace(/\D/g, "");
          const recipientPhone = lead.phone;

          if (token && phoneId) {
            await sendMetaWhatsappMessage(phoneId, token, recipientPhone, text);
          }
        }
      } catch (waErr) {
        console.error(`Meta API message transmission failed: ${waErr.message}`);
      }
    }

    try {
      const payload = {
        leadId: thread.leadId,
        id: message._id,
        sender: "agent",
        text: message.text,
        timestamp: message.timestamp.toISOString(),
        channel: message.channel
      };
      broadcastToCompany(companyId, "message_created", payload);
    } catch (err) {}

    await ChatThread.findByIdAndUpdate(thread._id, { updatedAt: new Date() });

    return res.status(201).json({
      id: message._id,
      sender: "agent",
      text: message.text,
      aiResponse: null,
      timestamp: message.timestamp.toISOString(),
      channel: message.channel
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /conversations/:leadId/auto-reply (Toggle AI Auto Reply)
export async function toggleAutoReply(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { leadId } = req.params;

  try {
    const thread = await ChatThread.findOne({ leadId });
    const lead = thread ? await Lead.findById(thread.leadId) : null;

    if (!thread || !lead || String(lead.companyId) !== String(companyId)) {
      return res.status(404).json({ error: "Conversation thread not found" });
    }

    const updated = await ChatThread.findByIdAndUpdate(
      thread._id,
      { aiAutoReply: !thread.aiAutoReply },
      { new: true }
    );

    return res.status(200).json({ leadId: updated.leadId, aiAutoReply: updated.aiAutoReply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PATCH /conversations/:leadId/messages/:messageId (Edit message text)
export async function editMessage(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { leadId, messageId } = req.params;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Message text is required" });

  try {
    const thread = await ChatThread.findOne({ leadId });
    const lead = thread ? await Lead.findById(thread.leadId) : null;

    if (!thread || !lead || String(lead.companyId) !== String(companyId)) {
      return res.status(404).json({ error: "Conversation thread not found" });
    }

    const message = await Message.findOne({ _id: messageId, threadId: thread._id });
    if (!message) {
      return res.status(404).json({ error: "Message not found in this conversation" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(messageId, { text }, { new: true });

    try {
      const payload = {
        leadId,
        messageId,
        text: updatedMessage.text,
        timestamp: updatedMessage.timestamp.toISOString()
      };
      broadcastToCompany(companyId, "message_edited", payload);
    } catch (err) {}

    return res.status(200).json({
      id: updatedMessage._id,
      text: updatedMessage.text,
      timestamp: updatedMessage.timestamp.toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /conversations/:leadId/messages/:messageId (Delete message for everyone)
export async function deleteMessage(req, res) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(400).json({ error: "Tenant Company ID is missing" });

  const { leadId, messageId } = req.params;

  try {
    const thread = await ChatThread.findOne({ leadId });
    const lead = thread ? await Lead.findById(thread.leadId) : null;

    if (!thread || !lead || String(lead.companyId) !== String(companyId)) {
      return res.status(404).json({ error: "Conversation thread not found" });
    }

    const message = await Message.findOne({ _id: messageId, threadId: thread._id });
    if (!message) {
      return res.status(404).json({ error: "Message not found in this conversation" });
    }

    await Message.findByIdAndDelete(messageId);

    try {
      const payload = {
        leadId,
        messageId
      };
      broadcastToCompany(companyId, "message_deleted", payload);
    } catch (err) {}

    return res.status(200).json({ status: "success", messageId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
