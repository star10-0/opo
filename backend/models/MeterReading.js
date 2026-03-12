import mongoose from "mongoose";

const MeterReadingSchema = new mongoose.Schema(
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
    pumpAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PumpAssignment",
      required: true,
      index: true,
    },
    pumpId: { type: mongoose.Schema.Types.ObjectId, ref: "Pump", required: true, index: true },
    fuelType: { type: String, enum: ["diesel", "gasoline", "kerosene"], required: true },
    readingType: {
      type: String,
      enum: ["opening", "price_change_marker", "closing", "correction"],
      required: true,
    },
    readingMode: {
      type: String,
      enum: ["manual", "automatic", "estimated"],
      default: "manual",
    },
    value: { type: Number, required: true, min: 0 },
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    locked: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("MeterReading", MeterReadingSchema);
