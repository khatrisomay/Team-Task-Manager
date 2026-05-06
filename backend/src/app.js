import path from "path";
import { fileURLToPath } from "url";

import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

const ensureMongoConnected = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected"
    });
  }

  next();
};

const ensureJwtConfigured = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({
      success: false,
      message: "JWT_SECRET is not configured"
    });
  }

  next();
};

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, origin || true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", ensureJwtConfigured, ensureMongoConnected, authRoutes);
app.use("/api/users", ensureJwtConfigured, ensureMongoConnected, userRoutes);
app.use("/api/projects", ensureJwtConfigured, ensureMongoConnected, projectRoutes);
app.use("/api/tasks", ensureJwtConfigured, ensureMongoConnected, taskRoutes);
app.use("/api/dashboard", ensureJwtConfigured, ensureMongoConnected, dashboardRoutes);

const frontendPath = path.join(__dirname, "..", "..", "frontend", "dist");
const hasFrontendBuild = fs.existsSync(path.join(frontendPath, "index.html"));

if (process.env.NODE_ENV === "production" && hasFrontendBuild) {
  app.use("/api", notFound);

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

export default app;
