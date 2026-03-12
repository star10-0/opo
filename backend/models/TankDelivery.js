import mongoose from "mongoose";

const TankDeliverySchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true
    },
    deliveryDate: { type: String, required: true },
    monthKey: { type: String, required: true, index: true },
    driverName: { type: String, required: true, trim: true },
    truckNumber: { type: String, required: true, trim: true },
    fuelType: {
      type: String,
      enum: ["diesel", "gasoline", "kerosene"],
      required: true
    },
    targetTankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StorageTank",
      required: true
    },
    quantityLiters: { type: Number, required: true, min: 0 },
    arrivalTime: { type: Date },
    unloadStartTime: { type: Date },
    unloadEndTime: { type: Date },
    unloadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

TankDeliverySchema.index({ stationId: 1, deliveryDate: 1 });
TankDeliverySchema.index({ stationId: 1, monthKey: 1 });
TankDeliverySchema.index({ stationId: 1, approvalStatus: 1, isDeleted: 1 });

export default mongoose.model("TankDelivery", TankDeliverySchema);
