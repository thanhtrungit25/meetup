import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { initDB } from "./config/db.js";
import { handleClerkWebhook } from "./controllers/webhookController.js";

const app = express();

// Connect to Neon & Initialize Tables
initDB();

const allowOrigins = process.env.ORIGINS.split(",");
app.use(cors({ origin: allowOrigins, credentials: true }));
app.use(cookieParser());

app.use("/api/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("API is live!"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
