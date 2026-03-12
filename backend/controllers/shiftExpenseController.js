import { shiftExpenseService } from "../services/shiftExpenseService.js";

export async function createShiftExpense(req, res, next) {
  try {
    const expense = await shiftExpenseService.create(req.body, {
      userId: req.body.recordedBy,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function listShiftExpenses(req, res, next) {
  try {
    const data = await shiftExpenseService.listByWorkerClosing(req.query.workerClosingId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
