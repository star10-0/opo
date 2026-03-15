import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      localStorage.removeItem("selectedStation");
      localStorage.removeItem("stationId");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

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
  if (import.meta.env.DEV && error?.response?.data) {
    console.error("[api-error]", error.response.data);
  }

  const status = Number(error?.response?.status || 0);
  const message =
    error?.response?.data?.message ||
    (error?.code === "ECONNABORTED" ? "انتهت مهلة الاتصال بالخادم" : "") ||
    error?.message ||
    "حدث خطأ غير متوقع أثناء الاتصال بالخادم";

  const normalized = new Error(message);
  normalized.status = status;
  if (error?.response?.data?.details && typeof error.response.data.details === "object") {
    normalized.fieldErrors = error.response.data.details;
  }
  return normalized;
};

export async function apiGet(url, config) {
  try {
    return unwrap(await http.get(url, config));
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiPost(url, body, config) {
  try {
    return unwrap(await http.post(url, body, config));
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiPut(url, body, config) {
  try {
    return unwrap(await http.put(url, body, config));
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiDelete(url, config) {
  try {
    return unwrap(await http.delete(url, config));
  } catch (error) {
    throw normalizeError(error);
  }
}

export default http;
