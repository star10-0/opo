import { apiGet, apiPost } from "./http";

export const pumpsApi = {
  list: (query) => apiGet(`/pumps?${new URLSearchParams(query).toString()}`),
  create: (payload) => apiPost("/pumps", payload),
};
