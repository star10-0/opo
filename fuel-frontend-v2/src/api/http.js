import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api"
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrap = (response) => {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "API operation failed");
    }
    return payload.data;
  }
  return payload;
};

export async function apiGet(url, config) {
  return unwrap(await http.get(url, config));
}

export async function apiPost(url, body, config) {
  return unwrap(await http.post(url, body, config));
}

export async function apiPut(url, body, config) {
  return unwrap(await http.put(url, body, config));
}

export async function apiDelete(url, config) {
  return unwrap(await http.delete(url, config));
}

export default http;
