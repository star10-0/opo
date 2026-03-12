import mongoose from "mongoose";

const FuelPricePeriodSchema = new mongoose.Schema(
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
    fuelType: { type: String, enum: ["diesel", "gasoline", "kerosene"], required: true },
    pricePerLiter: { type: Number, required: true, min: 0 },
    startReadingValue: { type: Number, required: true, min: 0 },
    endReadingValue: { type: Number, default: null, min: 0 },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "closed", "suspended"],
      default: "active",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("FuelPricePeriod", FuelPricePeriodSchema);
