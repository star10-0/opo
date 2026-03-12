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
import pumpRoutes from "./routes/pumpRoutes.js";
import operationalDayRoutes from "./routes/operationalDayRoutes.js";
import pumpAssignmentRoutes from "./routes/pumpAssignmentRoutes.js";
import meterReadingRoutes from "./routes/meterReadingRoutes.js";
import fuelPricePeriodRoutes from "./routes/fuelPricePeriodRoutes.js";

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
app.use("/api/pumps", pumpRoutes);
app.use("/api/operational-days", operationalDayRoutes);
app.use("/api/pump-assignments", pumpAssignmentRoutes);
app.use("/api/meter-readings", meterReadingRoutes);
app.use("/api/price-periods", fuelPricePeriodRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
