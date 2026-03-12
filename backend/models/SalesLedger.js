import mongoose from "mongoose";

const SalesLedgerSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    operationalDayId: { type: mongoose.Schema.Types.ObjectId, ref: "OperationalDay", required: true, index: true },
    sourceType: { type: String, enum: ["worker_closing", "vehicle_session"], required: true, index: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    workerClosingId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkerClosing" },
    fuelType: { type: String, required: true, trim: true },
    soldLiters: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    pricePeriodId: { type: mongoose.Schema.Types.ObjectId, ref: "FuelPricePeriod" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SalesLedgerSchema.index({ stationId: 1, operationalDayId: 1, sourceType: 1, sourceId: 1 });

export default mongoose.model("SalesLedger", SalesLedgerSchema);
