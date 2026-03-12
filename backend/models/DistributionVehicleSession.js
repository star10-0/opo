import mongoose from "mongoose";

const DistributionVehicleSessionSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    operationalDayId: { type: mongoose.Schema.Types.ObjectId, ref: "OperationalDay", required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributionVehicle", required: true, index: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverName: { type: String, trim: true },
    helperWorkerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    fuelType: { type: String, required: true, trim: true },
    openingReading: { type: Number, required: true, min: 0 },
    openingReadingLocked: { type: Boolean, default: true },
    closingReading: { type: Number, min: 0 },
    totalSoldLiters: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed", "submitted", "archived", "suspended"],
      default: "open",
      index: true,
    },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DistributionVehicleSession", DistributionVehicleSessionSchema);
