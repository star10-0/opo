import { apiGet } from "./http";

const buildQuery = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
).toString();

export const reportsApi = {
  daily: (params) => apiGet(`/reports/daily?${buildQuery(params)}`),
  weekly: (params) => apiGet(`/reports/weekly?${buildQuery(params)}`),
  monthly: (params) => apiGet(`/reports/monthly?${buildQuery(params)}`),
  variances: (params) => apiGet(`/reports/variances?${buildQuery(params)}`),
  distributionVehicle: (params) => apiGet(`/reports/distribution-vehicle?${buildQuery(params)}`),
  deliveriesTanks: (params) => apiGet(`/reports/deliveries-tanks?${buildQuery(params)}`),
  analyticsOverview: (params) => apiGet(`/reports/analytics/overview?${buildQuery(params)}`),
  enterpriseOversight: (params) => apiGet(`/reports/enterprise/oversight?${buildQuery(params)}`),
  exportCsvUrl: (params) => `/reports/export/csv?${buildQuery(params)}`,
  exportPdf: (params) => apiGet(`/reports/export/pdf?${buildQuery(params)}`),
};
