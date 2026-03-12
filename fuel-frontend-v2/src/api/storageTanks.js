import { apiGet, apiPost } from "./http";

export const storageTanksApi = {
  list: (stationId) => apiGet(`/tanks?stationId=${stationId}`),
  create: (payload) => apiPost("/tanks", payload)
};
