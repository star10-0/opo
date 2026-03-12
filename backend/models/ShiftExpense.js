import mongoose from "mongoose";

const ShiftExpenseSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    operationalDayId: { type: mongoose.Schema.Types.ObjectId, ref: "OperationalDay", required: true, index: true },
    workerClosingId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkerClosing", required: true, index: true },
    expenseType: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recordedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("ShiftExpense", ShiftExpenseSchema);
