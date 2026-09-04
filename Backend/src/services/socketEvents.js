import { Server } from "socket.io";
import { broadcastToCompany } from "../utils/sse.js";

let io = null;

/**
 * Initialize Socket.IO Server
 */
export function initSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    const companyId = socket.handshake.query.companyId || socket.handshake.auth?.companyId;
    if (companyId) {
      socket.join(companyId);
    }

    socket.on("join_company", (cId) => {
      if (cId) socket.join(cId);
    });

    socket.on("disconnect", () => {
      // Disconnected socket client
    });
  });

  console.log("⚡ Socket.IO real-time server initialized successfully");
  return io;
}

/**
 * Generic broadcast wrapper for both Socket.IO and SSE fallback
 */
export function broadcastRealtimeSocketEvent(companyId, eventName, payload) {
  if (!companyId || !eventName) return;
  
  // 1. Socket.IO Room Emit
  if (io) {
    try {
      io.to(companyId).emit(eventName, payload);
    } catch (err) {
      console.error(`[Socket.IO Error] Failed to emit ${eventName}:`, err);
    }
  }

  // 2. SSE Fallback Emit
  try {
    broadcastToCompany(companyId, eventName, payload);
  } catch (err) {
    console.error(`[SSE Error] Failed to emit ${eventName}:`, err);
  }
}

// Notification events
export function emitNotificationCreated(companyId, userId, notification) {
  broadcastRealtimeSocketEvent(companyId, "notification_created", {
    userId,
    notification
  });
}

// Lead events (creation, update, status change, assignment, conversion)
export function emitLeadEvent(companyId, eventName, leadData) {
  broadcastRealtimeSocketEvent(companyId, eventName, leadData);
}

// Deal events (creation, stage change, update, closure)
export function emitDealEvent(companyId, eventName, dealData) {
  broadcastRealtimeSocketEvent(companyId, eventName, dealData);
}

// Customer events
export function emitCustomerEvent(companyId, eventName, customerData) {
  broadcastRealtimeSocketEvent(companyId, eventName, customerData);
}

// Activity & Follow-up events
export function emitActivityEvent(companyId, eventName, activityData) {
  broadcastRealtimeSocketEvent(companyId, eventName, activityData);
}
