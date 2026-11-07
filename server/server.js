import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { initDB } from "./config/db.js";
import { handleClerkWebhook } from "./controllers/webhookController.js";
import meetingRouter from "./routes/meetingRoutes.js";
import { setupSocketIO } from "./socket.js";

const app = express();
const server = http.createServer(app);

// Connect to Neon & Initialize Tables
await initDB();

const allowOrigins = process.env.ORIGINS.split(",");
app.use(cors({ origin: allowOrigins, credentials: true }));
app.use(cookieParser());

app.use("/api/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("API is live!"));
app.use("/api/meetings", meetingRouter);

const io = new Server(server, {
  cors: { origin: allowOrigins, credentials: true }
});

setupSocketIO(io);

// Centralized error hander
app.use((err, _req, res, _next)=>{
  console.error(`[Error] ${err.message}`);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
