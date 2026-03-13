import { useEffect, useState } from "react";
import { notificationsApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useLanguage } from "../i18n/LanguageContext";

function NotificationsPage({ stationId }) {
  const { t } = useLanguage();
  const role = localStorage.getItem("role") || "worker";
  const [state, setState] = useState({ loading: true, error: "", rows: [] });

  const load = () => {
    if (!stationId) return;
    setState({ loading: true, error: "", rows: [] });
    notificationsApi.list({ stationId, role, limit: 50 })
      .then((rows) => setState({ loading: false, error: "", rows: rows?.items || rows || [] }))
      .catch((e) => setState({ loading: false, error: e.message, rows: [] }));
  };

  useEffect(() => {
    load();
  }, [stationId, role]);

  if (state.loading) return <LoadingState />;

  return (
    <div>
      <h3>{t("notifications")}</h3>
      {state.error ? (
        <>
          <ErrorState error={state.error} />
          <button onClick={load}>إعادة المحاولة</button>
        </>
      ) : null}
      {state.rows.length === 0 ? <EmptyState text={t("notificationsEmpty")} /> : state.rows.map((row, index) => (
        <div key={row._id || index} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div>{row.message}</div>
          <small>{row.date || row.createdAt ? new Date(row.date || row.createdAt).toLocaleString("ar-EG") : "--"}</small>
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;
