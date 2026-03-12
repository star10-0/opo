import { salesLedgerService } from "../services/salesLedgerService.js";

export async function generateSalesLedger(req, res, next) {
  try {
    const rows = await salesLedgerService.generateFromReadings(req.body);
    res.status(201).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function listSalesLedger(req, res, next) {
  try {
    const rows = await salesLedgerService.listByOperationalDay(req.query.operationalDayId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}
