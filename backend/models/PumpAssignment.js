import mongoose from "mongoose";

const PumpAssignmentSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    operationalDayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OperationalDay",
      required: true,
      index: true,
    },
    pumpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pump",
      required: true,
      index: true,
    },
    primaryWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    helperWorkerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignmentStartAt: { type: Date, default: Date.now },
    assignmentEndAt: { type: Date, default: null },
    openingReading: { type: Number, required: true, min: 0 },
    openingReadingLocked: { type: Boolean, default: false },
    openingReadingRecordedAt: { type: Date, default: Date.now },
    openingReadingRecordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    closingReading: { type: Number, default: null, min: 0 },
    closingReadingRecordedAt: { type: Date, default: null },
    closingReadingRecordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["open", "closed", "suspended"],
      default: "open",
      index: true,
    },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("PumpAssignment", PumpAssignmentSchema);
