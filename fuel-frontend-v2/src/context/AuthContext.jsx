/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "token",
  accountType: "accountType",
  selectedStation: "selectedStation",
  rememberMe: "rememberMe",
  rememberedEmail: "rememberedEmail",
  rememberedAccountType: "rememberedAccountType",
  role: "role",
  userName: "userName",
  userId: "userId",
  stationId: "stationId",
};

function clearSessionStorage() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.selectedStation);
  localStorage.removeItem(STORAGE_KEYS.stationId);
  localStorage.removeItem(STORAGE_KEYS.role);
  localStorage.removeItem(STORAGE_KEYS.userName);
  localStorage.removeItem(STORAGE_KEYS.userId);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEYS.token) || "");
  const [user, setUser] = useState(null);
  const [accountType, setAccountType] = useState(localStorage.getItem(STORAGE_KEYS.accountType) || "");
  const [selectedStation, setSelectedStation] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.selectedStation);
    return raw ? JSON.parse(raw) : null;
  });
  const [availableStations, setAvailableStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const applyAuthData = useCallback((payload) => {
    const nextToken = payload?.token || token;
    const nextUser = payload?.user || null;
    const nextAccountType = payload?.accountType || nextUser?.accountType || "";
    const nextSelected = payload?.selectedStation || null;

    if (nextToken) {
      localStorage.setItem(STORAGE_KEYS.token, nextToken);
      setToken(nextToken);
    }

    setUser(nextUser);
    setAccountType(nextAccountType);
    localStorage.setItem(STORAGE_KEYS.accountType, nextAccountType);

    if (nextSelected) {
      setSelectedStation(nextSelected);
      localStorage.setItem(STORAGE_KEYS.selectedStation, JSON.stringify(nextSelected));
      localStorage.setItem(STORAGE_KEYS.stationId, nextSelected._id);
    }

    localStorage.setItem(STORAGE_KEYS.role, nextUser?.role || "");
    localStorage.setItem(STORAGE_KEYS.userName, nextUser?.name || "");
    localStorage.setItem(STORAGE_KEYS.userId, nextUser?._id || "");
    setAvailableStations(Array.isArray(payload?.availableStations) ? payload.availableStations : []);
  }, [token]);

  const bootstrap = useCallback(async () => {
    const existingToken = localStorage.getItem(STORAGE_KEYS.token);
    if (!existingToken) {
      setLoading(false);
      return;
    }

    try {
      const payload = await authApi.me();
      applyAuthData(payload);
    } catch {
      clearSessionStorage();
      setToken("");
      setUser(null);
      setSelectedStation(null);
    } finally {
      setLoading(false);
    }
  }, [applyAuthData]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async ({ email, password, accountType: selectedType, rememberMe }) => {
    const payload = await authApi.login({ email, password, accountType: selectedType });
    applyAuthData(payload);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.rememberMe, "true");
      localStorage.setItem(STORAGE_KEYS.rememberedEmail, email);
      localStorage.setItem(STORAGE_KEYS.rememberedAccountType, selectedType || "");
    } else {
      localStorage.removeItem(STORAGE_KEYS.rememberMe);
      localStorage.removeItem(STORAGE_KEYS.rememberedEmail);
      localStorage.removeItem(STORAGE_KEYS.rememberedAccountType);
    }

    return payload;
  }, [applyAuthData]);

  const selectStation = useCallback(async (stationId) => {
    const payload = await authApi.selectStation(stationId);
    applyAuthData(payload);
    return payload;
  }, [applyAuthData]);

  const logout = useCallback(() => {
    clearSessionStorage();
    setToken("");
    setUser(null);
    setSelectedStation(null);
    setAvailableStations([]);
    const keepRemember = localStorage.getItem(STORAGE_KEYS.rememberMe) === "true";
    if (!keepRemember) {
      localStorage.removeItem(STORAGE_KEYS.accountType);
    }
  }, []);

  const remembered = useMemo(() => ({
    enabled: localStorage.getItem(STORAGE_KEYS.rememberMe) === "true",
    email: localStorage.getItem(STORAGE_KEYS.rememberedEmail) || "",
    accountType: localStorage.getItem(STORAGE_KEYS.rememberedAccountType) || localStorage.getItem(STORAGE_KEYS.accountType) || "",
  }), []);

  const value = useMemo(() => ({
    token,
    user,
    accountType,
    selectedStation,
    availableStations,
    loading,
    remembered,
    setAccountType: (type) => {
      setAccountType(type || "");
      if (type) localStorage.setItem(STORAGE_KEYS.accountType, type);
    },
    login,
    logout,
    selectStation,
    refreshMe: bootstrap,
    isAuthenticated: Boolean(token && user),
  }), [token, user, accountType, selectedStation, availableStations, loading, remembered, login, logout, selectStation, bootstrap]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
