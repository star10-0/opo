import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    (status === 401 ? "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى" : "") ||
    (status === 403 ? "ليس لديك صلاحية لتنفيذ هذا الإجراء" : "") ||
    (error?.code === "ECONNABORTED" ? "انتهت مهلة الاتصال بالخادم" : "") ||
    (!error?.response ? "تعذر الوصول إلى الخادم، تحقق من الاتصال أو إعدادات الرابط" : "") ||
    error?.message ||
    "حدث خطأ غير متوقع أثناء الاتصال بالخادم";
  return new Error(message);
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
