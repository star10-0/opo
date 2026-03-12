import { apiGet } from "./http";

export const reportsApi = {
  daily: (stationId, date) => apiGet(`/reports/daily?stationId=${stationId}&date=${date}`),
  weekly: (stationId, from, to) => apiGet(`/reports/weekly?stationId=${stationId}&from=${from}&to=${to}`),
  monthly: (stationId, monthKey) => apiGet(`/reports/monthly?stationId=${stationId}&monthKey=${monthKey}`),
  variances: (stationId, from, to) => apiGet(`/reports/variances?stationId=${stationId}&from=${from}&to=${to}`), // TODO: not in contract yet
  distributionVehicle: (stationId, date) => apiGet(`/reports/distribution-vehicle?stationId=${stationId}&date=${date}`) // TODO: not in contract yet
};
