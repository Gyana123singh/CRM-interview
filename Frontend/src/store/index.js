import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./slices/authSlice";
import leadReducer from "./slices/leadSlice";
import chatReducer from "./slices/chatSlice";
import automationReducer from "./slices/automationSlice";
import ticketReducer from "./slices/ticketSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    leads: leadReducer,
    chat: chatReducer,
    automation: automationReducer,
    tickets: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Auth Slice Exports
export * from "./slices/authSlice";

// Lead Slice Exports (Explicit exports to prevent name collisions with ticketSlice)
export {
  setLeads,
  addLead,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadFollowUp,
  setSelectedLeadId,
} from "./slices/leadSlice";

// Chat Slice Exports
export * from "./slices/chatSlice";

// Automation Slice Exports
export * from "./slices/automationSlice";

// Ticket Slice Exports (Explicit exports to prevent name collisions with leadSlice)
export {
  addTicket,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  addTicketMessage,
  setFilterPriority as setTicketFilterPriority,
  setFilterCategory as setTicketFilterCategory,
  setSelectedTicketId,
} from "./slices/ticketSlice";

// API Slice Exports
export * from "./api/leadsApi";
export * from "./api/dealsApi";
export * from "./api/customersApi";
export * from "./api/dashboardApi";

export default store;
