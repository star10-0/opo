import { apiGet, apiPost } from "./http";

const buildQuery = (params = {}) => new URLSearchParams(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
).toString();

export const automationApi = {
  preview: (params) => apiGet(`/automation/preview?${buildQuery(params)}`),
  pendingReviewReminders: (params) => apiGet(`/automation/pending-review-reminders?${buildQuery(params)}`),
  integrationCatalog: () => apiGet("/automation/integration-catalog"),
  runManual: (payload) => apiPost("/automation/run-manual", payload),
};
