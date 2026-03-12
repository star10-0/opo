import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "فشلت عملية الاتصال بالخادم");
    }
    return payload.data;
  }
  return payload;
};

const normalizeError = (error) => {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "حدث خطأ غير متوقع أثناء الاتصال بالخادم";

  const normalized = new Error(message);
  normalized.status = status;

  if (status === 401) {
    localStorage.removeItem("token");
  }

  return normalized;
};

async function request(handler) {
  try {
    const response = await handler();
    return unwrap(response);
  } catch (error) {
    throw normalizeError(error);
  }
}

export function apiGet(url, config) {
  return request(() => http.get(url, config));
}

export function apiPost(url, body, config) {
  return request(() => http.post(url, body, config));
}

export function apiPut(url, body, config) {
  return request(() => http.put(url, body, config));
}

export function apiDelete(url, config) {
  return request(() => http.delete(url, config));
}

export default http;
