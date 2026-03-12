import { useEffect, useMemo, useState } from "react";
import { stationApi, reportsApi, storageTanksApi, deliveriesApi, workerClosingsApi, approvalsApi } from "../api";
import { can, canAny } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import { useLanguage } from "../i18n/LanguageContext";
import OperationalDayPage from "./OperationalDayPage";
import PumpAssignmentsPage from "./PumpAssignmentsPage";
import WorkerClosingPage from "./WorkerClosingPage";
import DeliveriesPage from "./DeliveriesPage";
import StorageTanksPage from "./StorageTanksPage";
import DistributionVehiclePage from "./DistributionVehiclePage";
import ReportsPage from "./ReportsPage";
import ApprovalsPage from "./ApprovalsPage";
import AuditLogPage from "./AuditLogPage";
import NotificationsPage from "./NotificationsPage";

function Dashboard() {
  const { language, setLanguage, t } = useLanguage();
  const userName = localStorage.getItem("userName") || "مستخدم النظام";
  const role = localStorage.getItem("role") || "worker";
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const tabs = useMemo(() => [
    { key: "dashboard", label: t("home"), visible: can("view_dashboard") },
    { key: "operational-day", label: t("operationalDay"), visible: can("view_dashboard") },
    { key: "pump-assignments", label: t("pumpAssignments"), visible: can("open_pump_assignment") },
    { key: "worker-closing", label: t("workerClosing"), visible: canAny(["submit_own_closing", "review_worker_closings"]) },
    { key: "deliveries", label: t("deliveries"), visible: canAny(["register_delivery", "manage_deliveries", "review_deliveries_if_required"]) },
    { key: "tanks", label: t("tanks"), visible: can("manage_tanks") },
    { key: "distribution", label: t("distribution"), visible: canAny(["manage_distribution_vehicles", "create_distribution_vehicle_session_if_allowed"]) },
    { key: "reports", label: t("reports"), visible: can("view_reports") },
    { key: "approvals", label: t("approvals"), visible: canAny(["approve_post_archive_edits_where_allowed", "co_approve_sensitive_edits", "co_approve_deletes"]) },
    { key: "audit", label: t("auditLog"), visible: can("view_audit_logs") },
    { key: "notifications", label: t("notifications"), visible: true }
  ], [t]);

  const visibleTabs = useMemo(() => tabs.filter((x) => x.visible || role === "admin"), [tabs, role]);
  const [tab, setTab] = useState("dashboard");
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState(localStorage.getItem("stationId") || "");
  const [summary, setSummary] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    if (!visibleTabs.some((x) => x.key === tab)) {
      setTab(visibleTabs[0]?.key || "dashboard");
    }
  }, [visibleTabs, tab]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    stationApi.list().then((data) => {
      const list = Array.isArray(data) ? data : data?.items || [];
      setStations(list);
      const first = stationId || list[0]?._id;
      if (first) {
        setStationId(first);
        localStorage.setItem("stationId", first);
      } else {
        setSummary({ loading: false, error: "لا توجد محطات متاحة", data: null });
      }
    }).catch((error) => {
      setStations([]);
      setSummary({ loading: false, error: error.message || "تعذر تحميل المحطات", data: null });
    });
  }, []);

  useEffect(() => {
    if (!stationId) {
      setSummary((s) => ({ ...s, loading: false }));
      return;
    }

    setSummary({ loading: true, error: "", data: null });
    Promise.allSettled([
      reportsApi.daily({ stationId, date: today }),
      reportsApi.weekly({ stationId, from: weekStart, to: today }),
      reportsApi.monthly({ stationId, monthKey }),
      reportsApi.variances({ stationId, from: weekStart, to: today }),
      reportsApi.distributionVehicle({ stationId, from: weekStart, to: today }),
      reportsApi.deliveriesTanks({ stationId, monthKey }),
      storageTanksApi.list(stationId),
      deliveriesApi.list({ stationId, limit: 5 }),
      workerClosingsApi.list({ stationId, status: "suspended" }),
      approvalsApi.list({ stationId, finalStatus: "pending" }),
    ]).then((results) => {
      const errors = results.filter((r) => r.status === "rejected");
      const data = results.map((r) => (r.status === "fulfilled" ? r.value : null));
      setSummary({ loading: false, error: errors.length ? "بعض مؤشرات لوحة التحكم غير متاحة حاليًا." : "", data });
    });
  }, [stationId]);

  const renderHome = () => {
    if (summary.loading) return <LoadingState text="جارٍ تحميل مؤشرات المدير..." />;
    if (summary.error && !summary.data) return <ErrorState error={summary.error} />;
    if (!summary.data) return <EmptyState text={t("noData")} />;

    const [daily, weekly, monthly, variances, vehicle, tankDelivery, tanks, deliveries, suspended, approvals] = summary.data;
    return (
      <div>
        {summary.error ? <ErrorState error={summary.error} /> : null}
        <div style={grid}>
          <Card title="إجمالي اليوم" value={daily?.totals?.totalAmount ?? "--"} />
          <Card title="مقارنة أسبوعية" value={weekly?.comparisons?.salesDelta ?? "--"} />
          <Card title="مقارنة شهرية" value={monthly?.comparisons?.salesDelta ?? "--"} />
          <Card title="ملخص الخزانات" value={tankDelivery?.totals?.tankCurrentQuantity ?? "--"} />
          <Card title="سيارات التوزيع" value={vehicle?.totals?.totalAmount ?? "--"} />
          <Card title="ملخص الفروقات" value={variances?.totals?.totalVariance ?? "--"} />
          <Card title="موافقات معلقة" value={Array.isArray(approvals) ? approvals.length : approvals?.items?.length ?? "--"} />
          <Card title="حسابات معلقة/موقوفة" value={Array.isArray(suspended) ? suspended.length : suspended?.items?.length ?? "--"} />
          <Card title="عدد الخزانات" value={Array.isArray(tanks) ? tanks.length : "--"} />
          <Card title="آخر الصهاريج" value={Array.isArray(deliveries) ? deliveries.length : deliveries?.items?.length ?? "--"} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={sidebar}>
        <h2>{t("dashboard")}</h2>
        <p>{userName}</p>
        <p>{role}</p>
        <label>{t("language")}</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={select}>
          <option value="ar">{t("arabic")}</option>
          <option value="en">{t("english")}</option>
        </select>
        <select value={stationId} onChange={(e) => { setStationId(e.target.value); localStorage.setItem("stationId", e.target.value); }} style={select}>
          <option value="">{t("selectStation")}</option>
          {stations.map((s) => <option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>)}
        </select>
        {visibleTabs.map((tabItem) => (
          <button key={tabItem.key} style={menuBtn} onClick={() => setTab(tabItem.key)}>{tabItem.label}</button>
        ))}
        <button style={logoutBtn} onClick={logout}>{t("logout")}</button>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        {!stationId ? <EmptyState text={t("chooseStationToStart")} /> : null}
        {stationId && tab === "dashboard" && renderHome()}
        {stationId && tab === "operational-day" && <OperationalDayPage stationId={stationId} />}
        {stationId && tab === "pump-assignments" && <PumpAssignmentsPage stationId={stationId} />}
        {stationId && tab === "worker-closing" && <WorkerClosingPage stationId={stationId} />}
        {stationId && tab === "deliveries" && <DeliveriesPage stationId={stationId} />}
        {stationId && tab === "tanks" && <StorageTanksPage stationId={stationId} />}
        {stationId && tab === "distribution" && <DistributionVehiclePage stationId={stationId} />}
        {stationId && tab === "reports" && <ReportsPage stationId={stationId} />}
        {stationId && tab === "approvals" && <ApprovalsPage stationId={stationId} />}
        {stationId && tab === "audit" && <AuditLogPage stationId={stationId} />}
        {stationId && tab === "notifications" && <NotificationsPage stationId={stationId} />}
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return <div style={card}><div>{title}</div><strong>{value}</strong></div>;
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 };
const sidebar = { width: 260, background: "#111827", color: "#fff", padding: 16 };
const menuBtn = { width: "100%", marginBottom: 8, padding: 10, textAlign: "start", border: "none", borderRadius: 6 };
const logoutBtn = { width: "100%", padding: 10, marginTop: 10, background: "#dc2626", color: "#fff", border: "none", borderRadius: 6 };
const select = { width: "100%", padding: 10, marginBottom: 10 };

export default Dashboard;
