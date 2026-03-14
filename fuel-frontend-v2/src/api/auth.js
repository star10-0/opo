import { apiGet, apiPost } from "./http";

export const authApi = {
  login: (payload) => apiPost("/auth/login", payload),
  register: (payload) => apiPost("/auth/register", payload),
  me: () => apiGet("/auth/me"),
  selectStation: (stationId) => apiPost("/auth/select-station", { stationId }),
};
