import { useEffect, useState } from "react";
import { auditLogsApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useLanguage } from "../i18n/LanguageContext";

function AuditLogPage({ stationId }) {
  const { t } = useLanguage();
  const [state, setState] = useState({ loading: true, error: "", rows: [] });

  useEffect(() => {
    if (!stationId) return;
    setState({ loading: true, error: "", rows: [] });
    auditLogsApi.list(stationId)
      .then((rows) => setState({ loading: false, error: "", rows: rows?.items || rows || [] }))
      .catch((e) => setState({ loading: false, error: e.message, rows: [] }));
  }, [stationId]);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState error={state.error} />;
  if (state.rows.length === 0) return <EmptyState text={t("auditEmpty")} />;

  return (
    <div>
      <h3>{t("auditLog")}</h3>
      <table style={{ width: "100%" }}><thead><tr><th>{t("actor")}</th><th>{t("action")}</th><th>{t("time")}</th><th>{t("entity")}</th><th>{t("before")}</th><th>{t("after")}</th></tr></thead><tbody>
        {state.rows.map((row) => (
          <tr key={row._id}>
            <td>{row.userId || "--"}</td>
            <td>{row.actionType}</td>
            <td>{row.createdAt}</td>
            <td>{row.entityType}</td>
            <td><pre style={{ maxWidth: 240, overflow: "auto" }}>{JSON.stringify(row.beforeData || {}, null, 1)}</pre></td>
            <td><pre style={{ maxWidth: 240, overflow: "auto" }}>{JSON.stringify(row.afterData || {}, null, 1)}</pre></td>
          </tr>
        ))}
      </tbody></table>
    </div>
  );
}

export default AuditLogPage;
