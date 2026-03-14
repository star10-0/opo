import { apiGet, apiPost, apiPut } from "./http";

export const stationApi = {
  list: () => apiGet("/stations"),
  allowed: () => apiGet("/stations/allowed"),
  create: (payload) => apiPost("/stations", payload),
  bootstrap: (payload) => apiPost("/stations/bootstrap", payload),
  customization: (stationId) => apiGet(`/stations/${stationId}/customization`),
  updateCustomization: (stationId, payload) => apiPut(`/stations/${stationId}/customization`, payload),
};
