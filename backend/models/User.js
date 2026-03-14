import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["worker", "accountant", "admin", "manager"],
      default: "worker"
    },
    accountType: {
      type: String,
      enum: ["individual", "company"],
      default: "individual",
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    allowedStations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station"
    }],
    permissions: { type: [String], default: [] },
    stationAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station"
      }
    ],
    currentStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ accountType: 1, organization: 1, station: 1 });

export default mongoose.model("User", UserSchema);
