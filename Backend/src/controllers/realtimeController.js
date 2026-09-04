import jwt from "jsonwebtoken";
import { addClient, removeClient, listClients } from "../utils/sse.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-this-in-production";

export function subscribe(req, res) {
  const token = req.query.token || (req.headers.authorization || "").split(" ")[1];
  let companyId = req.query.companyId;
  let userId = "anon";

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      companyId = decoded.companyId || decoded.company || companyId;
      userId = decoded.id || userId;
    } catch (err) {
      // fallback to query companyId if present
    }
  }

  if (!companyId) return res.status(401).json({ error: "Missing token or companyId for realtime subscription" });

  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    "Access-Control-Allow-Origin": "*",
  });

  const clientId = `${userId}_${Date.now()}`;
  addClient(companyId, clientId, res);

  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ message: "connected", companyId })}\n\n`);

  req.on("close", () => {
    removeClient(companyId, clientId);
  });
}

export function getStats(req, res) {
  return res.status(200).json({ clients: listClients() });
}
