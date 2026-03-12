import ShiftExpense from "../models/ShiftExpense.js";
import WorkerClosing from "../models/WorkerClosing.js";
import { auditLogService } from "./auditLogService.js";

export const shiftExpenseService = {
  async create(payload, actor) {
    const expense = await ShiftExpense.create(payload);

    await WorkerClosing.findByIdAndUpdate(expense.workerClosingId, {
      $inc: { expenseAmount: expense.amount, expectedCash: -expense.amount, variance: -expense.amount },
    });

    await auditLogService.logSensitiveAction({
      stationId: expense.stationId,
      userId: actor.userId,
      actionType: "add_shift_expense",
      entityType: "ShiftExpense",
      entityId: expense._id,
      afterData: expense.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return expense;
  },

  async listByWorkerClosing(workerClosingId) {
    return ShiftExpense.find({ workerClosingId, isDeleted: false }).sort({ createdAt: -1 });
  },
};
