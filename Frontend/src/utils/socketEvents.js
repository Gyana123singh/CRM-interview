"use client";

import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { getSocketUrl, getApiUrl } from "./config";
import { leadsApi } from "@/store/api/leadsApi";
import { dealsApi } from "@/store/api/dealsApi";
import { customersApi } from "@/store/api/customersApi";
import { activitiesApi } from "@/store/api/activitiesApi";
import { notificationsApi } from "@/store/api/notificationsApi";

const eventListeners = new Map();
let socketInstance = null;

/**
 * Separate Frontend Socket.IO & Event Subscriber System
 */
export function subscribeToRealtimeEvent(eventName, callback) {
  if (!eventListeners.has(eventName)) {
    eventListeners.set(eventName, new Set());
  }
  eventListeners.get(eventName).add(callback);

  return () => {
    const set = eventListeners.get(eventName);
    if (set) {
      set.delete(callback);
      if (set.size === 0) eventListeners.delete(eventName);
    }
  };
}

export function notifyRealtimeSubscribers(eventName, payload) {
  const listeners = eventListeners.get(eventName);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Error in realtime subscriber for ${eventName}:`, err);
      }
    });
  }
}

/**
 * Setup Socket.IO Real-time Connection
 */
export function initRealtimeSocketListener(companyId, dispatch) {
  if (typeof window === "undefined" || !companyId) return null;

  const serverUrl = getSocketUrl();

  try {
    // 1. Connect Socket.IO client
    if (!socketInstance) {
      socketInstance = io(serverUrl, {
        query: { companyId },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10
      });

      socketInstance.on("connect", () => {
        console.log("⚡ Socket.IO client connected successfully:", socketInstance.id);
        socketInstance.emit("join_company", companyId);
      });

      // Notification event
      socketInstance.on("notification_created", (data) => {
        if (dispatch) {
          dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
        }
        notifyRealtimeSubscribers("notification_created", data);
        if (data.notification?.title) {
          toast.info(`🔔 ${data.notification.title}: ${data.notification.message}`);
        }
      });

      // Lead events
      ["lead_created", "lead_updated", "lead_assigned", "lead_converted"].forEach((evt) => {
        socketInstance.on(evt, (data) => {
          if (dispatch) {
            dispatch(leadsApi.util.invalidateTags(["Lead", { type: "Lead", id: "LIST" }]));
            dispatch(customersApi.util.invalidateTags(["Customer", { type: "Customer", id: "LIST" }]));
            dispatch(dealsApi.util.invalidateTags(["Deal", { type: "Deal", id: "LIST" }]));
          }
          notifyRealtimeSubscribers(evt, data);
          if (evt === "lead_created") {
            toast.info(`🎉 New Lead Captured: ${data.name || "Inbound Visitor"} (${data.source || "Website"})`);
          }
        });
      });

      // Deal events
      ["deal_created", "deal_updated", "deal_stage_changed", "deal_closed"].forEach((evt) => {
        socketInstance.on(evt, (data) => {
          if (dispatch) {
            dispatch(dealsApi.util.invalidateTags(["Deals"]));
          }
          notifyRealtimeSubscribers(evt, data);
        });
      });

      // Activity events
      socketInstance.on("activity_created", (data) => {
        if (dispatch) {
          dispatch(activitiesApi.util.invalidateTags(["Activities"]));
        }
        notifyRealtimeSubscribers("activity_created", data);
      });
    }

    // 2. SSE Fallback
    const backendUrl = getApiUrl();
    const eventSource = new EventSource(`${backendUrl}/events?companyId=${companyId}`);

    eventSource.addEventListener("notification_created", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (dispatch) dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
        notifyRealtimeSubscribers("notification_created", data);
      } catch (err) {}
    });

    eventSource.addEventListener("lead_created", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (dispatch) dispatch(leadsApi.util.invalidateTags(["Lead", { type: "Lead", id: "LIST" }]));
        notifyRealtimeSubscribers("lead_created", data);
      } catch (err) {}
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      eventSource.close();
    };
  } catch (err) {
    console.error("[Socket.IO Client Error] Connection failed:", err);
    return null;
  }
}
