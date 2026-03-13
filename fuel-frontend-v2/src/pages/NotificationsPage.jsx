import { useEffect, useMemo, useState } from "react";
import { notificationsApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useLanguage } from "../i18n/LanguageContext";

const priorityStyles = {
  high: { color: "#b91c1c", background: "#fee2e2" },
  medium: { color: "#92400e", background: "#fef3c7" },
  low: { color: "#065f46", background: "#d1fae5" },
};

function NotificationsPage({ stationId }) {
  const { t } = useLanguage();
  const role = localStorage.getItem("role") || "worker";
  const [filters, setFilters] = useState({ q: "", priority: "", type: "" });
  const [state, setState] = useState({ loading: true, error: "", rows: [], meta: null });

  const load = () => {
    if (!stationId || stationId === "__all__") {
      setState({ loading: false, error: "", rows: [], meta: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    notificationsApi.list({
      stationId,
      role,
      limit: 50,
      q: filters.q.trim(),
      priorities: filters.priority || undefined,
      types: filters.type || undefined,
    })
      .then((data) => setState({ loading: false, error: "", rows: data?.items || [], meta: data?.meta || null }))
      .catch((e) => setState({ loading: false, error: e.message, rows: [], meta: null }));
  };

  useEffect(() => {
    load();
  }, [stationId, role]);

  const typeOptions = useMemo(() => [
    { value: "", label: "كل الأنواع" },
    { value: "variance", label: "فروقات مالية" },
    { value: "pending_closing", label: "إغلاقات مرسلة" },
    { value: "approval_new", label: "طلبات موافقة" },
    { value: "tank_low", label: "انخفاض الخزانات" },
    { value: "stale_operational_day", label: "يوم تشغيلي قديم" },
  ], []);

  if (state.loading) return <LoadingState />;

  return (
    <div>
      <h3>{t("notifications")}</h3>
      <p style={{ marginTop: 0, color: "#64748b" }}>اعرض أهم التنبيهات أولًا، وابحث داخل الرسائل لتسريع المتابعة.</p>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginBottom: 12 }}>
        <input
          value={filters.q}
          placeholder="بحث داخل التنبيهات"
          onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") load(); }}
        />
        <select value={filters.priority} onChange={(e) => setFilters((s) => ({ ...s, priority: e.target.value }))}>
          <option value="">كل الأولويات</option>
          <option value="high">عالية</option>
          <option value="medium">متوسطة</option>
          <option value="low">منخفضة</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters((s) => ({ ...s, type: e.target.value }))}>
          {typeOptions.map((opt) => <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>)}
        </select>
        <button onClick={load}>تطبيق الفلاتر</button>
      </div>

      {state.error ? (
        <>
          <ErrorState error={state.error} />
          <button onClick={load}>إعادة المحاولة</button>
        </>
      ) : null}

      {state.meta ? (
        <small style={{ color: "#64748b", display: "block", marginBottom: 8 }}>
          إجمالي المعروض: {state.rows.length} | تنبيهات محسوبة: {state.meta.computedCount ?? 0} | تنبيهات محفوظة: {state.meta.persistedCount ?? 0}
        </small>
      ) : null}

      {stationId === "__all__" ? <EmptyState text="اختر محطة واحدة لعرض التنبيهات التفصيلية." /> : null}
      {stationId !== "__all__" && state.rows.length === 0 ? <EmptyState text={t("notificationsEmpty")} /> : null}
      {stationId !== "__all__" ? state.rows.map((row, index) => {
        const priority = row.priority || "low";
        return (
          <div key={row._id || `${row.type}-${index}`} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{row.message}</span>
              <span style={{ ...priorityStyles[priority], borderRadius: 999, padding: "2px 8px", fontSize: 12 }}>
                {priority === "high" ? "عالية" : priority === "medium" ? "متوسطة" : "منخفضة"}
              </span>
            </div>
            <small style={{ color: "#64748b" }}>{row.date || row.createdAt ? new Date(row.date || row.createdAt).toLocaleString("ar-EG") : "--"}</small>
          </div>
        );
      }) : null}
    </div>
  );
}

export default NotificationsPage;
