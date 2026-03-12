import mongoose from "mongoose";

const DistributionVehicleSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    vehicleName: { type: String, required: true, trim: true },
    vehicleCode: { type: String, required: true, trim: true },
    defaultFuelType: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DistributionVehicleSchema.index({ stationId: 1, vehicleCode: 1 }, { unique: true });

export default mongoose.model("DistributionVehicle", DistributionVehicleSchema);
