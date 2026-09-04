import { getApiUrl } from "./config";

export async function downloadCSV(endpoint, defaultFilename = "export.csv") {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/${endpoint.startsWith("/") ? endpoint.slice(1) : endpoint}`;

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      // Direct window open fallback with query token
      const fallbackUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
      window.open(fallbackUrl, "_blank");
      return;
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    
    // Extract filename from header if available
    const disposition = response.headers.get("content-disposition");
    let filename = defaultFilename;
    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("CSV Download error:", error);
    // Direct open fallback
    const apiUrl = getApiUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const fallbackUrl = token ? `${apiUrl}/${endpoint}?token=${encodeURIComponent(token)}` : `${apiUrl}/${endpoint}`;
    window.open(fallbackUrl, "_blank");
  }
}
