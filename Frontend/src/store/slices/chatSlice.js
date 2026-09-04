import { createSlice } from "@reduxjs/toolkit";

const mockThreads = [
  {
    leadId: "lead_01",
    leadName: "Rahul Mohanty",
    phone: "+91 98765 43210",
    aiAutoReply: true,
    status: "active",
    messages: [
      {
        id: "msg_1",
        sender: "customer",
        text: "Hi, I saw your ad for Patia 2BHK luxury flats.",
        timestamp: "2026-05-30T09:30:00Z",
        channel: "WhatsApp",
      },
      {
        id: "msg_2",
        sender: "bot",
        text: "Hi Rahul, thank you for your inquiry! We have beautiful 2BHK ready-to-move flats in Patia. May I know your preferred budget range so we can suggest the best options?",
        timestamp: "2026-05-30T09:30:05Z",
        channel: "WhatsApp",
      },
      {
        id: "msg_3",
        sender: "customer",
        text: "My budget is around 55 to 60 Lakhs maximum.",
        timestamp: "2026-05-30T09:32:00Z",
        channel: "WhatsApp",
      },
    ],
  },
  {
    leadId: "lead_02",
    leadName: "Dr. Sunita Rao",
    phone: "+91 94321 09876",
    aiAutoReply: false,
    status: "active",
    messages: [
      {
        id: "msg_4",
        sender: "customer",
        text: "Do you have calendar bookings integrated in WhatsApp?",
        timestamp: "2026-05-30T10:10:00Z",
        channel: "WhatsApp",
      },
      {
        id: "msg_5",
        sender: "agent",
        text: "Yes Dr. Sunita, we support full WhatsApp-based booking slots. A client can view open slots and confirm immediately.",
        timestamp: "2026-05-30T10:14:00Z",
        channel: "WhatsApp",
      },
    ],
  },
];

const initialState = {
  threads: mockThreads,
  activeThreadId: "lead_01",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setThreads: (state, action) => {
      state.threads = action.payload;
      const exists = action.payload.some((t) => t.leadId === state.activeThreadId);
      if (!exists && action.payload.length > 0) {
        state.activeThreadId = action.payload[0].leadId;
      }
    },
    sendMessage: (state, action) => {
      const thread = state.threads.find((t) => t.leadId === action.payload.leadId);
      if (thread) {
        const newMsg = {
          id: `msg_${Math.random().toString(36).substr(2, 9)}`,
          sender: action.payload.sender,
          text: action.payload.text,
          timestamp: new Date().toISOString(),
          channel: "WhatsApp",
        };
        thread.messages.push(newMsg);
      }
    },
    toggleAiAutoReply: (state, action) => {
      const thread = state.threads.find((t) => t.leadId === action.payload.leadId);
      if (thread) {
        thread.aiAutoReply = !thread.aiAutoReply;
      }
    },
    setActiveThread: (state, action) => {
      state.activeThreadId = action.payload;
    },
    createNewThread: (state, action) => {
      const exists = state.threads.some((t) => t.leadId === action.payload.leadId);
      if (!exists) {
        state.threads.unshift({
          leadId: action.payload.leadId,
          leadName: action.payload.name,
          phone: action.payload.phone,
          messages: [],
          aiAutoReply: true,
          status: "active",
        });
      }
      state.activeThreadId = action.payload.leadId;
    },
    addMessage: (state, action) => {
      const thread = state.threads.find((t) => t.leadId === action.payload.leadId);
      if (thread) {
        const isDuplicate = thread.messages.some(
          (m) =>
            m.id === action.payload.message.id ||
            (m.sender === action.payload.message.sender &&
              m.text === action.payload.message.text &&
              Math.abs(new Date(m.timestamp).getTime() - new Date(action.payload.message.timestamp).getTime()) < 10000)
        );
        if (!isDuplicate) {
          thread.messages.push(action.payload.message);
        }
      } else {
        state.threads.unshift({
          leadId: action.payload.leadId,
          leadName: action.payload.message.sender === "customer" ? "Customer" : "Conversation",
          phone: "",
          messages: [action.payload.message],
          aiAutoReply: true,
          status: "active",
        });
      }
    },
    deleteMessageLocal: (state, action) => {
      const thread = state.threads.find((t) => t.leadId === action.payload.leadId);
      if (thread) {
        thread.messages = thread.messages.filter((m) => m.id !== action.payload.messageId);
      }
    },
    editMessageLocal: (state, action) => {
      const thread = state.threads.find((t) => t.leadId === action.payload.leadId);
      if (thread) {
        const message = thread.messages.find((m) => m.id === action.payload.messageId);
        if (message) {
          message.text = action.payload.text;
        }
      }
    },
  },
});

export const {
  sendMessage,
  toggleAiAutoReply,
  setActiveThread,
  createNewThread,
  setThreads,
  deleteMessageLocal,
  editMessageLocal
} = chatSlice.actions;
export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
