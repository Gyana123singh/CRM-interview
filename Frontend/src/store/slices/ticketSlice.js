import { createSlice } from "@reduxjs/toolkit";

const mockTickets = [
  {
    id: "tkt_01",
    title: "Meta Cloud Webhook Delivery Delays",
    description: "Our WhatsApp lead cards are taking upwards of 30 minutes to update dynamic status tags. We suspect a webhook retry storm or route blocking in the Meta Business App configuration.",
    category: "Technical Bug",
    priority: "High",
    status: "In Progress",
    createdBy: "Amit Sharma",
    creatorRole: "team",
    companyId: "company_99",
    companyName: "CRM Sales Management System",
    assignedTo: "System Engineer",
    createdAt: "2026-06-03T10:00:00Z",
    updatedAt: "2026-06-04T12:00:00Z",
    messages: [
      {
        id: "msg_01",
        senderName: "Amit Sharma",
        senderRole: "team",
        text: "The webhooks are returning a lot of 502 Bad Gateway responses when customer leads are created in bulk.",
        createdAt: "2026-06-03T10:05:00Z"
      },
      {
        id: "msg_02",
        senderName: "Pradeep Patra",
        senderRole: "admin",
        text: "I checked our app dashboard, and it seems our server is getting hammered. I've escalated this to platform support to check routing pools.",
        createdAt: "2026-06-03T11:15:00Z"
      },
      {
        id: "msg_03",
        senderName: "Super Admin Support",
        senderRole: "admin",
        text: "Hi Pradeep and Amit, we are looking into the ingress load balancer. We identified a memory leak in the auto-assignment router queue. Deploying a hotfix now. Status updated to In Progress.",
        createdAt: "2026-06-04T12:00:00Z"
      }
    ]
  },
  {
    id: "tkt_02",
    title: "Representative seat count double billing",
    description: "We upgraded our subscription plan to the Growth tier yesterday and added 2 extra representative seats. The invoice shows double charging on the base seat fee. Please issue a refund/credit.",
    category: "Billing",
    priority: "Critical",
    status: "Open",
    createdBy: "Pradeep Patra",
    creatorRole: "admin",
    companyId: "company_99",
    companyName: "CRM Sales Management System",
    assignedTo: "Billing Desk",
    createdAt: "2026-06-04T14:30:00Z",
    updatedAt: "2026-06-04T14:30:00Z",
    messages: [
      {
        id: "msg_04",
        senderName: "Pradeep Patra",
        senderRole: "admin",
        text: "Please review INV-2026-004. An extra ₹5,000 was deducted. Attached our invoice log for reference.",
        createdAt: "2026-06-04T14:32:00Z"
      }
    ]
  },
  {
    id: "tkt_03",
    title: "Lead Card CSV custom fields exporter request",
    description: "Our sales reps need follow-up notes and timestamps included in the CSV file when they export leads. Currently, only basic contact info is included.",
    category: "Feature Request",
    priority: "Low",
    status: "Resolved",
    createdBy: "Amit Sharma",
    creatorRole: "team",
    companyId: "company_99",
    companyName: "CRM Sales Management System",
    assignedTo: "Product Team",
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-02T16:00:00Z",
    messages: [
      {
        id: "msg_05",
        senderName: "Amit Sharma",
        senderRole: "team",
        text: "It would save us 3-4 hours of manual copy-pasting every week if notes were in the export sheet.",
        createdAt: "2026-06-01T09:05:00Z"
      },
      {
        id: "msg_06",
        senderName: "Super Admin Support",
        senderRole: "admin",
        text: "We have released an update to the CSV exporter module. You can now select columns dynamically before downloading from the Reports tab.",
        createdAt: "2026-06-02T15:30:00Z"
      },
      {
        id: "msg_07",
        senderName: "Amit Sharma",
        senderRole: "team",
        text: "Yes, I tested it! It works perfectly now. Closing this ticket.",
        createdAt: "2026-06-02T16:00:00Z"
      }
    ]
  },
  {
    id: "tkt_04",
    title: "Appointment booking slot overlay bug",
    description: "When a customer selects a slot on WhatsApp chatbot flow, the slot remains open for booking on the frontend calendar instead of blocking it instantly. This causes double bookings.",
    category: "Technical Bug",
    priority: "High",
    status: "Open",
    createdBy: "Rina Das",
    creatorRole: "team",
    companyId: "company_88",
    companyName: "Health Clinic India",
    assignedTo: "System Engineer",
    createdAt: "2026-06-05T08:15:00Z",
    updatedAt: "2026-06-05T08:15:00Z",
    messages: [
      {
        id: "msg_08",
        senderName: "Rina Das",
        senderRole: "team",
        text: "Happened twice today for dental checkups. Need urgent fix to lock slots on API verification.",
        createdAt: "2026-06-05T08:16:00Z"
      }
    ]
  }
];

const initialState = {
  tickets: mockTickets,
  selectedTicketId: null,
  searchQuery: "",
  filterStatus: "All",
  filterPriority: "All",
  filterCategory: "All",
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    addTicket: (state, action) => {
      const newTicket = {
        ...action.payload,
        id: `tkt_${Math.random().toString(36).substr(2, 9)}`,
        status: "Open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      state.tickets.unshift(newTicket);
    },
    updateTicketStatus: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
        ticket.updatedAt = new Date().toISOString();
      }
    },
    updateTicketPriority: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.id);
      if (ticket) {
        ticket.priority = action.payload.priority;
        ticket.updatedAt = new Date().toISOString();
      }
    },
    assignTicket: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.id);
      if (ticket) {
        ticket.assignedTo = action.payload.assignedTo;
        ticket.updatedAt = new Date().toISOString();
      }
    },
    addTicketMessage: (state, action) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        const newMessage = {
          id: `msg_${Math.random().toString(36).substr(2, 9)}`,
          senderName: action.payload.senderName,
          senderRole: action.payload.senderRole,
          text: action.payload.text,
          createdAt: new Date().toISOString(),
        };
        ticket.messages.push(newMessage);
        ticket.updatedAt = new Date().toISOString();
      }
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedTicketId: (state, action) => {
      state.selectedTicketId = action.payload;
    },
  },
});

export const {
  addTicket,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  addTicketMessage,
  setFilterStatus,
  setFilterPriority,
  setFilterCategory,
  setSearchQuery,
  setSelectedTicketId,
} = ticketSlice.actions;

export default ticketSlice.reducer;
