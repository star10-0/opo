import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import auth from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import tankRoutes from "./routes/tankRoutes.js";
import pumpRoutes from "./routes/pumpRoutes.js";
import pumpAssignmentRoutes from "./routes/pumpAssignmentRoutes.js";
import meterReadingRoutes from "./routes/meterReadingRoutes.js";
import fuelPricePeriodRoutes from "./routes/fuelPricePeriodRoutes.js";
import operationalDayRoutes from "./routes/operationalDayRoutes.js";
import workerClosingRoutes from "./routes/workerClosingRoutes.js";
import shiftExpenseRoutes from "./routes/shiftExpenseRoutes.js";
import distributionVehicleRoutes from "./routes/distributionVehicleRoutes.js";
import distributionVehicleSessionRoutes from "./routes/distributionVehicleSessionRoutes.js";
import salesLedgerRoutes from "./routes/salesLedgerRoutes.js";
import reconciliationRoutes from "./routes/reconciliationRoutes.js";
import approvalRequestRoutes from "./routes/approvalRequestRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";
const enforceAuth = process.env.ENFORCE_AUTH === "true";
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  if (!allowedOrigins.length) {
    if (!isProd) return callback(null, true);
    return callback(new Error("CORS is not configured for production"));
  }

  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin is not allowed by CORS"));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProd ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fuel Station API is running",
  });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.json({
    success: true,
    status: dbState === 1 || !isProd ? "ok" : "degraded",
    authEnforced: enforceAuth,
    env: process.env.NODE_ENV || "development",
    db: dbStatus,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

if (enforceAuth) {
  app.use("/api", auth);
}

app.use("/api/stations", stationRoutes);
app.use("/api/tanks", tankRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/pumps", pumpRoutes);
app.use("/api/pump-assignments", pumpAssignmentRoutes);
app.use("/api/meter-readings", meterReadingRoutes);
app.use("/api/price-periods", fuelPricePeriodRoutes);
app.use("/api/operational-days", operationalDayRoutes);
app.use("/api/worker-closings", workerClosingRoutes);
app.use("/api/shift-expenses", shiftExpenseRoutes);
app.use("/api/distribution-vehicles", distributionVehicleRoutes);
app.use("/api/distribution-vehicle-sessions", distributionVehicleSessionRoutes);
app.use("/api/sales-ledger", salesLedgerRoutes);
app.use("/api/reconciliations", reconciliationRoutes);
app.use("/api/approval-requests", approvalRequestRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
let server;

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    if (isProd) {
      console.error("❌ Failed to start in production without database connection.");
      process.exit(1);
    }
    console.warn("⚠️ تعذر الاتصال بقاعدة البيانات، سيعمل الخادم في وضع محدود.");
  }

  server = app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT} [env=${process.env.NODE_ENV || "development"}] [auth=${enforceAuth ? "on" : "off"}]`);
    if (isProd && !allowedOrigins.length) {
      console.warn("⚠️ FRONTEND_URL is empty in production, cross-origin requests will be rejected by CORS.");
    }
  });
};

const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (!server) {
    process.exit(0);
  }
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

start();
