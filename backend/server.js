import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";

import tankRoutes from "./routes/tankRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import gpsRoutes from "./routes/gpsRoutes.js";
import workerClosingRoutes from "./routes/workerClosingRoutes.js";
import shiftExpenseRoutes from "./routes/shiftExpenseRoutes.js";
import distributionVehicleRoutes from "./routes/distributionVehicleRoutes.js";
import distributionVehicleSessionRoutes from "./routes/distributionVehicleSessionRoutes.js";
import salesLedgerRoutes from "./routes/salesLedgerRoutes.js";
import reconciliationRoutes from "./routes/reconciliationRoutes.js";
import approvalRequestRoutes from "./routes/approvalRequestRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

await connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Fuel System API Running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.use("/api/tanks", tankRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gps", gpsRoutes);
app.use("/api/worker-closings", workerClosingRoutes);
app.use("/api/expenses", shiftExpenseRoutes);
app.use("/api/distribution-vehicles", distributionVehicleRoutes);
app.use("/api/distribution-vehicle-sessions", distributionVehicleSessionRoutes);
app.use("/api/sales-ledger", salesLedgerRoutes);
app.use("/api/reconciliation", reconciliationRoutes);
app.use("/api/approval-requests", approvalRequestRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
