import { apiGet, apiPost } from "./http";

export const operationalDayApi = {
  getCurrent: (stationId) => apiGet(`/operational-days/current?stationId=${stationId}`),
  open: (payload) => apiPost("/operational-days/open", payload),
  close: (id) => apiPost(`/operational-days/${id}/close`, {})
};
