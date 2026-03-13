import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    targetRole: { type: String, enum: ["worker", "accountant", "admin"], required: true, index: true },
    type: { type: String, default: "general" },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },
    message: { type: String, required: true },
    actionLabel: { type: String, default: "" },
    seen: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
