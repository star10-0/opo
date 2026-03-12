import WorkerClosing from "../models/WorkerClosing.js";
import ReconciliationBatch from "../models/ReconciliationBatch.js";
import { auditLogService } from "./auditLogService.js";

export const reconciliationService = {
  async reviewOperationalDay({ stationId, operationalDayId, reviewedBy, status, notes }, actor) {
    const closings = await WorkerClosing.find({ stationId, operationalDayId, isDeleted: false });

    const totals = closings.reduce(
      (acc, c) => {
        acc.totalGrossSales += Number(c.grossSalesAmount || 0);
        acc.totalExpenses += Number(c.expenseAmount || 0);
        acc.totalExpectedCash += Number(c.expectedCash || 0);
        acc.totalActualCash += Number(c.actualCash || 0);
        acc.totalVariance += Number(c.variance || 0);
        return acc;
      },
      { totalGrossSales: 0, totalExpenses: 0, totalExpectedCash: 0, totalActualCash: 0, totalVariance: 0 }
    );

    const batch = await ReconciliationBatch.create({
      stationId,
      operationalDayId,
      workerClosingIds: closings.map((c) => c._id),
      ...totals,
      status: status || "pending_review",
      reviewedBy,
      reviewedAt: new Date(),
      notes: notes || "",
      managerNotified: status === "suspended",
    });

    await auditLogService.logSensitiveAction({
      stationId,
      userId: actor.userId,
      actionType: "reconcile_operational_day",
      entityType: "ReconciliationBatch",
      entityId: batch._id,
      afterData: batch.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return batch;
  },
};
