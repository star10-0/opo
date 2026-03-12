import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["worker", "accountant", "admin", "manager"],
      default: "worker"
    },
    permissions: { type: [String], default: [] },
    stationAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station"
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, isActive: 1 });

export default mongoose.model("User", UserSchema);
