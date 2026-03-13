import { apiGet, apiPost } from "./http";

export const approvalsApi = {
  list: (query) => apiGet(`/approval-requests?${new URLSearchParams(query).toString()}`),
  create: (payload) => apiPost("/approval-requests", payload),
  accountantDecision: (id, payload) => apiPost(`/approval-requests/${id}/accountant-decision`, payload),
  managerDecision: (id, payload) => apiPost(`/approval-requests/${id}/manager-decision`, payload)
};
