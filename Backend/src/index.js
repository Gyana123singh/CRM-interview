import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/api.js";
import { setupSwagger } from "./config/swagger.js";
import { connectDB } from "./config/db.js";
import { initSocketIO } from "./services/socketEvents.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

setupSwagger(app);

app.use("/api", router);
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.json({ message: "Multi-Tenant CRM Backend System operational (Socket.IO + MongoDB)" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Something went wrong inside the server" });
});

// Initialize Socket.IO
initSocketIO(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`CRM backend with Socket.IO running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});
