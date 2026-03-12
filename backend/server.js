import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

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

const isProduction = process.env.NODE_ENV === "production";
const corsOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan(isProduction ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fuel Station API is running",
  });
});

app.get("/api/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const statusCode = dbConnected ? 200 : 503;

  res.status(statusCode).json({
    success: dbConnected,
    status: dbConnected ? "ok" : "degraded",
    service: "backend",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      state: mongoose.connection.readyState,
      name: mongoose.connection.name || null,
    },
  });
});

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

app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("⚠️ تعذر الاتصال بقاعدة البيانات، سيعمل الخادم في وضع محدود.");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

start();
