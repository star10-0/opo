import { useLanguage } from "../i18n/LanguageContext";

const baseBox = {
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
  border: "1px solid transparent",
};

export function LoadingState({ text }) {
  const { t } = useLanguage();
  return <p style={{ ...baseBox, color: "#1d4ed8", background: "#eff6ff", borderColor: "#bfdbfe" }}>{text || t("loading")}</p>;
}

export function EmptyState({ text }) {
  const { t } = useLanguage();
  return <p style={{ ...baseBox, color: "#334155", background: "#f8fafc", borderColor: "#cbd5e1" }}>{text || t("noData")}</p>;
}

export function ErrorState({ error }) {
  if (!error) return null;
  return <p style={{ ...baseBox, color: "#b91c1c", background: "#fef2f2", borderColor: "#fecaca" }}>{error}</p>;
}

export function SuccessState({ message }) {
  if (!message) return null;
  return <p style={{ ...baseBox, color: "#166534", background: "#f0fdf4", borderColor: "#bbf7d0" }}>{message}</p>;
}
