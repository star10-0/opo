import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { env, validateEnv } from "./config/env.js";
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
const { isProd, enforceAuth, port: PORT, frontendOrigins: allowedOrigins } = env;
const envValidation = validateEnv();

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (!allowedOrigins.length) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("CORS origin not allowed"));
};

app.disable("x-powered-by");
app.set("trust proxy", 1);

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
  const dbReady = [1, 2].includes(Number(mongoose.connection.readyState));
  res.json({
    success: true,
    status: "ok",
    authEnforced: enforceAuth,
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins.length ? allowedOrigins : ["*"],
    dbConnected: dbReady,
    configuration: {
      ok: envValidation.ok,
      warnings: envValidation.warnings,
    },
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

let server;

const start = async () => {
  if (!envValidation.ok) {
    console.error("❌ Invalid environment configuration:");
    envValidation.errors.forEach((item) => console.error(` - ${item}`));
    process.exit(1);
  }

  envValidation.warnings.forEach((item) => console.warn(`⚠️ ${item}`));

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
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🔐 Auth enforced: ${enforceAuth ? "yes" : "no"}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(", ") : "*"}`);
  });
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (!server) {
    process.exit(0);
  }
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.error("Error while closing database connection:", error);
    }
    process.exit(0);
  });
};

process.on("SIGINT", () => { shutdown("SIGINT"); });
process.on("SIGTERM", () => { shutdown("SIGTERM"); });
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

start();
