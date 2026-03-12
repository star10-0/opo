import mongoose from "mongoose";

const StorageTankSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true
    },
    tankName: { type: String, required: true, trim: true },
    tankCode: { type: String, required: true, trim: true },
    fuelType: {
      type: String,
      enum: ["diesel", "gasoline", "kerosene"],
      required: true
    },
    capacityLiters: { type: Number, required: true, min: 0 },
    currentQuantityLiters: { type: Number, default: 0, min: 0 },
    lowLevelThreshold: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active"
    },
    notes: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

StorageTankSchema.index({ stationId: 1, tankCode: 1 }, { unique: true });
StorageTankSchema.index({ stationId: 1, status: 1, isDeleted: 1 });

export default mongoose.model("StorageTank", StorageTankSchema);
