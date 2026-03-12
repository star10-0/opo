import { useLanguage } from "../i18n/LanguageContext";

export function LoadingState({ text }) {
  const { t } = useLanguage();
  return <p style={{ color: "#475569" }}>{text || t("loading")}</p>;
}

export function EmptyState({ text }) {
  const { t } = useLanguage();
  return <p style={{ color: "#64748b", background: "#f8fafc", padding: 12, borderRadius: 8 }}>{text || t("noData")}</p>;
}

export function ErrorState({ error }) {
  return <p style={{ color: "#b91c1c", background: "#fee2e2", padding: 12, borderRadius: 8 }}>{error}</p>;
}

export function SuccessState({ message }) {
  if (!message) return null;
  return <p style={{ color: "#065f46", background: "#d1fae5", padding: 12, borderRadius: 8 }}>{message}</p>;
}
