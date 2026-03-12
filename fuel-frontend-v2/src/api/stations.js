import { apiGet, apiPost } from "./http";

export const stationApi = {
  list: () => apiGet("/stations"),
  create: (payload) => apiPost("/stations", payload)
};
