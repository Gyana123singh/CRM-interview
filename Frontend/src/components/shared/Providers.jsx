"use client";
 
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store, setUser, addLead, createNewThread, addMessage, updateLeadStatus } from "@/store";
import { API_URL } from "@/utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { initRealtimeSocketListener } from "@/utils/socketEvents";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          dispatch(setUser(user));

          // Connect modular real-time socket & stream listener
          const cleanupSocket = initRealtimeSocketListener(user.companyId || "company-infotattva-id", dispatch);

          // connect to realtime SSE
          try {
            const es = new EventSource(`${API_URL}/api/realtime?token=${token}`);
            es.addEventListener("lead_created", (ev) => {
              try {
                const payload = JSON.parse(ev.data);
                dispatch(addLead(payload));
              } catch (e) {}
            });
            es.addEventListener("lead_updated", (ev) => {
              try {
                const payload = JSON.parse(ev.data);
                dispatch(updateLeadStatus({ id: payload.id, status: payload.status }));
              } catch (e) {}
            });
            es.addEventListener("message_created", (ev) => {
              try {
                const payload = JSON.parse(ev.data);
                dispatch(createNewThread({ leadId: payload.leadId, name: payload.leadId, phone: "" }));
                dispatch(addMessage({ leadId: payload.leadId, message: {
                  id: payload.id,
                  sender: payload.sender,
                  text: payload.text,
                  timestamp: payload.timestamp,
                  channel: payload.channel || "WhatsApp"
                }}));
              } catch (e) {}
            });
            es.addEventListener("billing_updated", (ev) => {
              try {
                const payload = JSON.parse(ev.data);
                toast.success(`🎉 Real-time Upgrade: Workspace plan updated to ${payload.planName}!`, {
                  position: "top-right",
                  autoClose: 5000
                });
                if (typeof window !== "undefined") {
                  const customEv = new CustomEvent("billingPlanUpdated", { detail: payload });
                  window.dispatchEvent(customEv);
                }
              } catch (err) {}
            });
            // close on unload
            window.addEventListener("beforeunload", () => {
              es.close();
              if (cleanupSocket) cleanupSocket();
            });
          } catch (err) {
            console.warn("Realtime subscription failed:", err);
          }
        } catch (e) {
          console.error("Failed to parse user session", e);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </ThemeProvider>
      </AuthInitializer>
    </Provider>
  );
}
