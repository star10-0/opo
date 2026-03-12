import AuditLog from "../models/AuditLog.js";

export const auditLogService = {
  async logSensitiveAction(payload) {
    return AuditLog.create(payload);
  },

  async listByStation(stationId) {
    return AuditLog.find({ stationId }).sort({ createdAt: -1 });
  },
};
