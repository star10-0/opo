import { apiDelete, apiGet, apiPost, apiPut } from "./http";

export const deliveriesApi = {
  list: (query) => apiGet(`/deliveries?${new URLSearchParams(query).toString()}`),
  create: (payload) => apiPost("/deliveries", payload),
  update: (id, payload) => apiPut(`/deliveries/${id}`, payload),
  softDelete: (id) => apiDelete(`/deliveries/${id}`) // backend should perform logical delete
};
