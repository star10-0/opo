import { apiGet, apiPost } from "./http";

export const workerClosingsApi = {
  list: (query) => apiGet(`/worker-closings?${new URLSearchParams(query).toString()}`), // TODO: fallback until backend GET is finalized
  upsert: (payload) => apiPost("/worker-closings", payload),
  submit: (id) => apiPost(`/worker-closings/${id}/submit`, {})
};
