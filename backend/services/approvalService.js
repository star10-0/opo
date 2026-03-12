import ApprovalRequest from "../models/ApprovalRequest.js";
import { auditLogService } from "./auditLogService.js";
import { notificationService } from "./notificationService.js";

function recomputeFinalStatus(request) {
  if (request.accountantDecision.decision === "rejected" || request.managerDecision.decision === "rejected") {
    request.finalStatus = "rejected";
    return;
  }

  if (request.accountantDecision.decision === "approved" && request.managerDecision.decision === "approved") {
    request.finalStatus = "approved";
  }
}

export const approvalService = {
  async list(filters = {}) {
    const query = { isDeleted: false };
    if (filters.stationId) query.stationId = filters.stationId;
    if (filters.finalStatus) query.finalStatus = filters.finalStatus;
    return ApprovalRequest.find(query).sort({ createdAt: -1 });
  },

  async create(payload, actor) {
    const request = await ApprovalRequest.create(payload);
    await auditLogService.logSensitiveAction({
      stationId: request.stationId,
      userId: actor.userId,
      actionType: "create_approval_request",
      entityType: "ApprovalRequest",
      entityId: request._id,
      afterData: request.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    await notificationService.create({
      stationId: request.stationId,
      targetRole: "accountant",
      type: "approval_new",
      message: `طلب موافقة جديد (${request.requestType}) بانتظار المراجعة`,
    });

    return request;
  },

  async accountantDecision(id, decision, actor) {
    const request = await ApprovalRequest.findOne({ _id: id, isDeleted: false });
    if (!request) throw new Error("Approval request not found");

    request.accountantDecision = {
      decision: decision.decision,
      by: decision.by,
      at: new Date(),
      note: decision.note || "",
    };
    recomputeFinalStatus(request);
    await request.save();

    await notificationService.create({
      stationId: request.stationId,
      targetRole: "admin",
      type: "approval_accountant_decision",
      message: `قرار المحاسب (${decision.decision}) على طلب ${request.requestType}`,
    });

    return request;
  },

  async managerDecision(id, decision, actor) {
    const request = await ApprovalRequest.findOne({ _id: id, isDeleted: false });
    if (!request) throw new Error("Approval request not found");

    request.managerDecision = {
      decision: decision.decision,
      by: decision.by,
      at: new Date(),
      note: decision.note || "",
    };
    recomputeFinalStatus(request);
    await request.save();

    await auditLogService.logSensitiveAction({
      stationId: request.stationId,
      userId: actor.userId,
      actionType: "decision_approval_request",
      entityType: "ApprovalRequest",
      entityId: request._id,
      afterData: request.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return request;
  },
};
