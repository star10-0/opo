import WorkerClosing from "../models/WorkerClosing.js";
import { auditLogService } from "./auditLogService.js";

function computeFinancialFields(data) {
  const grossSalesAmount = Number(data.grossSalesAmount || 0);
  const expenseAmount = Number(data.expenseAmount || 0);
  const bankDepositAmount = Number(data.bankDepositAmount || 0);
  const actualCash = Number(data.actualCash || 0);
  const expectedCash = grossSalesAmount - expenseAmount - bankDepositAmount;
  const variance = actualCash - expectedCash;
  return { expectedCash, variance };
}

export const workerClosingService = {
  async create(payload, actor) {
    const totals = computeFinancialFields(payload);
    const created = await WorkerClosing.create({ ...payload, ...totals });

    await auditLogService.logSensitiveAction({
      stationId: created.stationId,
      userId: actor.userId,
      actionType: "create_worker_closing",
      entityType: "WorkerClosing",
      entityId: created._id,
      afterData: created.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return created;
  },

  async submit(id, actor) {
    const existing = await WorkerClosing.findOne({ _id: id, isDeleted: false });
    if (!existing) throw new Error("Worker closing not found");

    const before = existing.toObject();
    existing.status = "submitted";
    existing.submittedAt = new Date();
    await existing.save();

    await auditLogService.logSensitiveAction({
      stationId: existing.stationId,
      userId: actor.userId,
      actionType: "submit_worker_closing",
      entityType: "WorkerClosing",
      entityId: existing._id,
      beforeData: before,
      afterData: existing.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return existing;
  },

  async list(filters = {}) {
    const query = {
      stationId: filters.stationId,
      operationalDayId: filters.operationalDayId,
      status: filters.status,
      isDeleted: false,
    };

    Object.keys(query).forEach((key) => {
      if (query[key] === undefined || query[key] === null || query[key] === "") {
        delete query[key];
      }
    });

    const parsedLimit = Number(filters.limit || 100);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 300) : 100;

    return WorkerClosing.find(query).sort({ createdAt: -1 }).limit(limit);
  },
};
