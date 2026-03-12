import { auditLogService } from "../services/auditLogService.js";

export async function listAuditLogs(req, res, next) {
  try {
    const logs = await auditLogService.listByStation(req.query.stationId);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}
