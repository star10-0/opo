import { useEffect, useMemo, useState } from "react";
import { notificationsApi, stationApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useLanguage } from "../i18n/LanguageContext";

const severityStyles = {
  low: { color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  medium: { color: "#854d0e", bg: "#fefce8", border: "#fde68a" },
  high: { color: "#9a3412", bg: "#fff7ed", border: "#fdba74" },
  critical: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
};

function NotificationsPage({ stationId }) {
  const { t } = useLanguage();
  const role = localStorage.getItem("role") || "worker";
  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({ stationMode: "active", severity: "", query: "" });
  const [state, setState] = useState({ loading: true, error: "", rows: [] });

  useEffect(() => {
    stationApi.allowed().then((data) => {
      const rows = Array.isArray(data) ? data : data?.items || [];
      setStations(rows);
    }).catch(() => setStations([]));
  }, []);

  useEffect(() => {
    if (!stationId) return;

    const stationIds = filters.stationMode === "all"
      ? stations.map((s) => s._id).filter(Boolean).join(",")
      : stationId;

    notificationsApi.list({ stationId: stationIds, role, limit: 120 })
      .then((rows) => setState({ loading: false, error: "", rows: rows?.items || rows || [] }))
      .catch((e) => setState({ loading: false, error: e.message, rows: [] }));
  }, [stationId, role, filters.stationMode, stations]);

  const filteredRows = useMemo(() => {
    return state.rows.filter((row) => {
      const bySeverity = filters.severity ? row.severity === filters.severity : true;
      const text = `${row.message || ""} ${row.type || ""} ${row.actionLabel || ""}`.toLowerCase();
      const byQuery = filters.query.trim() ? text.includes(filters.query.trim().toLowerCase()) : true;
      return bySeverity && byQuery;
    });
  }, [state.rows, filters]);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState error={state.error} />;

  return (
    <div>
      <h3>{t("notifications")}</h3>
      <div style={filtersStyle}>
        <select value={filters.stationMode} onChange={(e) => setFilters((s) => ({ ...s, stationMode: e.target.value }))}>
          <option value="active">المحطة الحالية</option>
          <option value="all">كل المحطات المتاحة</option>
        </select>
        <select value={filters.severity} onChange={(e) => setFilters((s) => ({ ...s, severity: e.target.value }))}>
          <option value="">كل مستويات الأهمية</option>
          <option value="low">منخفض</option>
          <option value="medium">متوسط</option>
          <option value="high">مرتفع</option>
          <option value="critical">حرج</option>
        </select>
        <input
          value={filters.query}
          placeholder="بحث داخل التنبيهات"
          onChange={(e) => setFilters((s) => ({ ...s, query: e.target.value }))}
        />
      </div>
      {filteredRows.length === 0 ? <EmptyState text={t("notificationsEmpty")} /> : filteredRows.map((row, index) => {
        const style = severityStyles[row.severity] || severityStyles.medium;
        return (
          <div key={row._id || `${row.type}-${index}`} style={{ border: `1px solid ${style.border}`, background: style.bg, borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <strong style={{ color: style.color }}>{row.message}</strong>
              <small style={{ color: style.color }}>{row.severity || "medium"}</small>
            </div>
            <small>{row.actionLabel || ""}</small>
            <br />
            <small>{row.date || row.createdAt}</small>
          </div>
        );
      })}
    </div>
  );
}

const filtersStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 8,
  marginBottom: 12,
};

export default NotificationsPage;
