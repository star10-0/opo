import mongoose from "mongoose";

const ReconciliationBatchSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    operationalDayId: { type: mongoose.Schema.Types.ObjectId, ref: "OperationalDay", required: true, index: true },
    workerClosingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkerClosing" }],
    totalGrossSales: { type: Number, required: true, default: 0 },
    totalExpenses: { type: Number, required: true, default: 0 },
    totalExpectedCash: { type: Number, required: true, default: 0 },
    totalActualCash: { type: Number, required: true, default: 0 },
    totalVariance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending_review", "approved", "suspended"],
      default: "pending_review",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    managerNotified: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ReconciliationBatchSchema.index({ stationId: 1, operationalDayId: 1 });

export default mongoose.model("ReconciliationBatch", ReconciliationBatchSchema);
