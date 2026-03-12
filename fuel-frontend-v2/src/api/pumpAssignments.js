import { apiGet, apiPost } from "./http";

export const pumpAssignmentsApi = {
  list: (query) => apiGet(`/pump-assignments?${new URLSearchParams(query).toString()}`), // TODO: fallback until backend GET is finalized
  create: (payload) => apiPost("/pump-assignments", payload),
  lockOpening: (id) => apiPost(`/pump-assignments/${id}/lock-opening`, {}),
  close: (id) => apiPost(`/pump-assignments/${id}/close`, {})
};
