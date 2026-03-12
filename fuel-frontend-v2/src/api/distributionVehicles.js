import { apiGet, apiPost } from "./http";

export const distributionVehicleApi = {
  listVehicles: (stationId) => apiGet(`/distribution-vehicles?stationId=${stationId}`),
  createVehicle: (payload) => apiPost("/distribution-vehicles", payload),
  listSessions: (query) => apiGet(`/distribution-vehicle-sessions?${new URLSearchParams(query).toString()}`), // TODO: fallback until backend GET is finalized
  createSession: (payload) => apiPost("/distribution-vehicle-sessions", payload),
  closeSession: (id) => apiPost(`/distribution-vehicle-sessions/${id}/close`, {})
};
