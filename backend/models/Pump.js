import mongoose from "mongoose";

const PumpSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    pumpName: { type: String, required: true, trim: true },
    pumpCode: { type: String, required: true, trim: true },
    fuelType: {
      type: String,
      enum: ["diesel", "gasoline", "kerosene"],
      required: true,
    },
    linkedTankIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "StorageTank" }],
    meterUnit: { type: String, default: "liter" },
    isActive: { type: Boolean, default: true },
    openingLockEnabled: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PumpSchema.index({ stationId: 1, pumpCode: 1 }, { unique: true });

export default mongoose.model("Pump", PumpSchema);
