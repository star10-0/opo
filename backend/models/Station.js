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
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

StationSchema.index({ code: 1 }, { unique: true });
StationSchema.index({ status: 1, isDeleted: 1 });

export default mongoose.model("Station", StationSchema);
