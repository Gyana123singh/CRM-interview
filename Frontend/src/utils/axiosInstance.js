import axios from "axios";
import { getBackendUrl, getApiUrl } from "./config";

export const API_URL = getApiUrl();

export const axiosInstance = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("[Axios Interceptor] Requesting:", config.url, "Token:", token ? "Found" : "Missing");
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    if (config.url && !config.url.startsWith("/api") && !config.url.startsWith("http")) {
      config.url = `/api${config.url.startsWith("/") ? "" : "/"}${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
