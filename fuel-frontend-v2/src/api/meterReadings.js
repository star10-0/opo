import { apiPost } from "./http";

export const meterReadingsApi = {
  create: (payload) => apiPost("/meter-readings", payload)
};
