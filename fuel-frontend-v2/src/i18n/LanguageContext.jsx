import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANG_AR, translations } from "./translations";

const LanguageContext = createContext({
  language: LANG_AR,
  setLanguage: () => {},
  t: (key, fallback = "") => fallback,
});

function normalizeLanguage(value) {
  return value === "en" ? "en" : LANG_AR;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => normalizeLanguage(localStorage.getItem("lang") || LANG_AR));

  useEffect(() => {
    localStorage.setItem("lang", language);
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: (next) => setLanguageState(normalizeLanguage(next)),
    t: (key, fallback = "") => translations?.[language]?.[key] ?? translations.ar[key] ?? fallback,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
