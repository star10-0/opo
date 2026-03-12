import mongoose from "mongoose";

const WorkerClosingSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    operationalDayId: { type: mongoose.Schema.Types.ObjectId, ref: "OperationalDay", required: true, index: true },
    pumpAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "PumpAssignment", required: true, index: true },
    primaryWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    helperWorkerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    totalSoldLiters: { type: Number, required: true, min: 0, default: 0 },
    grossSalesAmount: { type: Number, required: true, min: 0, default: 0 },
    expenseAmount: { type: Number, required: true, min: 0, default: 0 },
    bankDepositAmount: { type: Number, required: true, min: 0, default: 0 },
    expectedCash: { type: Number, required: true, default: 0 },
    actualCash: { type: Number, required: true, default: 0 },
    variance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed", "archived", "suspended"],
      default: "draft",
      index: true,
    },
    submittedAt: { type: Date },
    accountantReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountantReviewedAt: { type: Date },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

WorkerClosingSchema.index({ stationId: 1, operationalDayId: 1, pumpAssignmentId: 1 }, { unique: true });

export default mongoose.model("WorkerClosing", WorkerClosingSchema);
