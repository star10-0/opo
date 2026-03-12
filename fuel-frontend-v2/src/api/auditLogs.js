import { apiGet } from "./http";

export const auditLogsApi = {
  list: (stationId) => apiGet(`/audit-logs?stationId=${stationId}`)
};
