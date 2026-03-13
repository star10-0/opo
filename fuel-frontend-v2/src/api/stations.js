import { apiGet, apiPost } from "./http";

export const stationApi = {
  list: () => apiGet("/stations"),
  allowed: () => apiGet("/stations/allowed"),
  create: (payload) => apiPost("/stations", payload),
  bootstrap: (payload) => apiPost("/stations/bootstrap", payload),
};
