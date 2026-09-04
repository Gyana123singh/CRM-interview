import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "@/utils/config";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
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
