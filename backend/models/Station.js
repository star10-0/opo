import mongoose from "mongoose";

const StationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active"
    },
    defaultDayOpenTime: { type: String, default: "06:00" },
    timezone: { type: String, default: "Asia/Baghdad" },
    projectCustomization: {
      alerts: {
        approvalOverdueHours: { type: Number, default: 24, min: 1, max: 168 },
        closingOverdueHours: { type: Number, default: 12, min: 1, max: 72 },
        staleOperationalDayHours: { type: Number, default: 18, min: 6, max: 72 },
        highVarianceRatePct: { type: Number, default: 2, min: 0.5, max: 20 },
      },
      workflow: {
        startTabByRole: {
          admin: { type: String, default: "dashboard" },
          manager: { type: String, default: "operational-day" },
          accountant: { type: String, default: "worker-closing" },
          worker: { type: String, default: "pump-assignments" },
        },
      },
      ui: {
        dashboardCompactCards: { type: Boolean, default: true },
      },
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

StationSchema.index({ code: 1 }, { unique: true });
StationSchema.index({ status: 1, isDeleted: 1 });

export default mongoose.model("Station", StationSchema);
