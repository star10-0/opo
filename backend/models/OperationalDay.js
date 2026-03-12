import mongoose from "mongoose";

const OperationalDaySchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    operationalDate: { type: String, required: true },
    autoOpenTime: { type: String, default: null },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
      index: true,
    },
    openedAutomatically: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    archivedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OperationalDaySchema.index(
  { stationId: 1, operationalDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "open", isDeleted: false },
  }
);

export default mongoose.model("OperationalDay", OperationalDaySchema);
