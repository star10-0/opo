import { apiGet } from "./http";

export const notificationsApi = {
  list: (query) => apiGet(`/notifications?${new URLSearchParams(query).toString()}`)
};
