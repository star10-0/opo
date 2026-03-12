import axios from "axios";

const runtimeApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const defaultApiBaseUrl = import.meta.env.DEV ? "http://localhost:5000/api" : "/api";

export const API_BASE_URL = runtimeApiBaseUrl || defaultApiBaseUrl;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
      throw new Error(payload.message || "فشلت عملية الاتصال بالخادم");
    }
    return payload.data;
  }
  return payload;
};

const normalizeError = (error) => {
  if (!error?.response) {
    return new Error("تعذر الوصول إلى الخادم. تأكد من تشغيل الخدمة أو إعداد VITE_API_BASE_URL بشكل صحيح.");
  }

  const message =
    error?.response?.data?.message ||
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
