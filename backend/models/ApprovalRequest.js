import mongoose from "mongoose";

const decisionSchema = new mongoose.Schema(
  {
    decision: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    at: { type: Date, default: null },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const ApprovalRequestSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    requestType: {
      type: String,
      enum: ["edit", "delete", "reopen", "unlock_opening_reading"],
      required: true,
      index: true,
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    beforeSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    proposedChanges: { type: mongoose.Schema.Types.Mixed, default: null },
    accountantDecision: { type: decisionSchema, default: () => ({}) },
    managerDecision: { type: decisionSchema, default: () => ({}) },
    finalStatus: { type: String, enum: ["pending", "approved", "rejected", "applied"], default: "pending", index: true },
    appliedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalRequest", ApprovalRequestSchema);
