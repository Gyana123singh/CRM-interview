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

export * from "./slices/authSlice";
export * from "./slices/leadSlice";
export * from "./slices/chatSlice";
export * from "./slices/automationSlice";
export * from "./slices/ticketSlice";
export * from "./api/leadsApi";
export * from "./api/dealsApi";
export * from "./api/customersApi";
export * from "./api/dashboardApi";

export default store;
