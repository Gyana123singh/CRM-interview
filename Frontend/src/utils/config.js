/**
 * Central Environment & Server URL Configuration
 * Environment variables configured in .env:
 * - Local: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_SOCKET_URL
 * - Live: NEXT_PUBLIC_LIVE_API_URL, NEXT_PUBLIC_LIVE_BACKEND_URL, NEXT_PUBLIC_LIVE_SOCKET_URL
 */

export const LIVE_FRONTEND_URL = process.env.NEXT_PUBLIC_LIVE_FRONTEND_URL || "https://crm.sjemsbamunigam.in";
export const LIVE_BACKEND_URL = process.env.NEXT_PUBLIC_LIVE_BACKEND_URL || "https://api.sjemsbamunigam.in";
export const LOCAL_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * Detects if the app is executing in a live production environment
 */
export function isLiveEnvironment() {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.endsWith(".local");
    return !isLocalhost;
  }
  return process.env.NODE_ENV === "production";
}

/**
 * Resolves Backend Server Base URL (without trailing slash or /api)
 */
export function getBackendUrl() {
  if (isLiveEnvironment()) {
    return (process.env.NEXT_PUBLIC_LIVE_BACKEND_URL || LIVE_BACKEND_URL).replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_BACKEND_URL || LOCAL_BACKEND_URL).replace(/\/$/, "");
}

/**
 * Resolves Backend API Base URL (ending in /api)
 */
export function getApiUrl() {
  if (isLiveEnvironment()) {
    const liveApi = process.env.NEXT_PUBLIC_LIVE_API_URL || `${LIVE_BACKEND_URL}/api`;
    return liveApi.endsWith("/api") ? liveApi : `${liveApi.replace(/\/$/, "")}/api`;
  }
  const localApi = process.env.NEXT_PUBLIC_API_URL || `${LOCAL_BACKEND_URL}/api`;
  return localApi.endsWith("/api") ? localApi : `${localApi.replace(/\/$/, "")}/api`;
}

/**
 * Resolves Socket.IO Real-time Connection Server URL
 */
export function getSocketUrl() {
  if (isLiveEnvironment()) {
    return (process.env.NEXT_PUBLIC_LIVE_SOCKET_URL || process.env.NEXT_PUBLIC_LIVE_BACKEND_URL || LIVE_BACKEND_URL).replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || LOCAL_BACKEND_URL).replace(/\/$/, "");
}
