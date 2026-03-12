import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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
const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin }));
app.use(helmet());
app.use(express.json());
app.use(morgan(isProd ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fuel Station API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api", auth);

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

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED_REJECTION]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT_EXCEPTION]", error);
});

start();
