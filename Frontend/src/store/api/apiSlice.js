import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }
  return "http://localhost:5000/api";
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || localStorage.getItem("crm_token");
      }
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [
    "Lead",
    "Customer",
    "Deal",
    "Activity",
    "Dashboard",
    "Notification",
    "Conversation",
    "Campaign",
    "WhatsappContact",
    "WhatsappGroup",
    "Appointment",
    "Knowledge",
    "User",
    "AuditLog"
  ],
  endpoints: () => ({})
});
