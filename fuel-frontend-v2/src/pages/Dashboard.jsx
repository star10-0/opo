import { useEffect, useMemo, useState } from "react";
import { stationApi, reportsApi, storageTanksApi, deliveriesApi, workerClosingsApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";
import OperationalDayPage from "./OperationalDayPage";
import PumpAssignmentsPage from "./PumpAssignmentsPage";
import WorkerClosingPage from "./WorkerClosingPage";
import DeliveriesPage from "./DeliveriesPage";
import StorageTanksPage from "./StorageTanksPage";
import DistributionVehiclePage from "./DistributionVehiclePage";
import ReportsPage from "./ReportsPage";

const TABS = [
  { key: "dashboard", label: "الرئيسية", permission: "view_dashboard" },
  { key: "operational-day", label: "اليوم التشغيلي", permission: "view_dashboard" },
  { key: "pump-assignments", label: "استلامات المضخات", permission: "open_pump_assignment" },
  { key: "worker-closing", label: "إغلاق العامل", permission: "submit_own_closing" },
  { key: "deliveries", label: "الصهاريج", permission: "register_delivery" },
  { key: "tanks", label: "الخزانات", permission: "manage_tanks" },
  { key: "distribution", label: "سيارة التوزيع", permission: "manage_distribution_vehicles" },
  { key: "reports", label: "التقارير", permission: "view_reports" }
];

function Dashboard() {
  const userName = localStorage.getItem("userName") || "مستخدم النظام";
  const role = localStorage.getItem("role") || "worker";
  const visibleTabs = useMemo(() => TABS.filter((t) => can(t.permission) || role === "admin"), [role]);
  const [tab, setTab] = useState(visibleTabs[0]?.key || "dashboard");
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState(localStorage.getItem("stationId") || "");
  const [summary, setSummary] = useState({ loading: true, error: "", data: null });

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    stationApi
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || [];
        setStations(list);
        const first = stationId || list[0]?._id;
        if (first) {
          setStationId(first);
          localStorage.setItem("stationId", first);
        } else {
          setSummary({ loading: false, error: "لا توجد محطات متاحة", data: null });
        }
      })
      .catch((error) => {
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
      reportsApi.daily(stationId, new Date().toISOString().slice(0, 10)),
      storageTanksApi.list(stationId),
      deliveriesApi.list({ stationId, limit: 5 }),
      workerClosingsApi.list({ stationId, status: "pending" }),
      reportsApi.weekly(stationId, new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)),
      reportsApi.monthly(stationId, `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`),
      reportsApi.distributionVehicle(stationId, new Date().toISOString().slice(0, 10))
    ]).then((results) => {
      const errors = results.filter((r) => r.status === "rejected");
      const data = results.map((r) => (r.status === "fulfilled" ? r.value : null));
      setSummary({
        loading: false,
        error: errors.length ? "بعض مؤشرات لوحة التحكم غير متاحة حاليًا." : "",
        data
      });
    });
  }, [stationId]);

  const renderHome = () => {
    if (summary.loading) return <LoadingState />;
    if (summary.error && !summary.data) return <ErrorState error={summary.error} />;
    if (!summary.data) return <EmptyState text="لا توجد بيانات للعرض" />;
    const [daily, tanks, deliveries, pending, weekly, monthly, vehicleSales] = summary.data;

    return (
      <div>
        {summary.error ? <ErrorState error={summary.error} /> : null}
        <div style={grid}>
          <Card title="مبيعات اليوم" value={daily?.totals?.totalAmount ?? "--"} />
          <Card title="الفروقات المالية" value={daily?.totals?.totalVariance ?? "--"} />
          <Card title="عدد الخزانات" value={Array.isArray(tanks) ? tanks.length : "--"} />
          <Card title="آخر الصهاريج" value={Array.isArray(deliveries) ? deliveries.length : deliveries?.items?.length ?? "--"} />
          <Card title="الحسابات المعلقة" value={Array.isArray(pending) ? pending.length : pending?.items?.length ?? "--"} />
          <Card title="مبيعات سيارة التوزيع" value={vehicleSales?.totals?.totalAmount ?? "--"} />
          <Card title="مقارنة أسبوعية" value={weekly?.comparisons ? "متاح" : "غير متاح"} />
          <Card title="مقارنة شهرية" value={monthly?.comparisons ? "متاح" : "غير متاح"} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={sidebar}>
        <h2>لوحة التحكم</h2>
        <p>{userName}</p>
        <p>{role}</p>
        <select value={stationId} onChange={(e) => setStationId(e.target.value)} style={select}>
          <option value="">اختر محطة</option>
          {stations.map((s) => (
            <option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>
          ))}
        </select>
        {visibleTabs.map((t) => (
          <button key={t.key} style={menuBtn} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
        <button style={logoutBtn} onClick={logout}>تسجيل الخروج</button>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        {!stationId ? <EmptyState text="يرجى اختيار محطة للبدء" /> : null}
        {stationId && tab === "dashboard" && renderHome()}
        {stationId && tab === "operational-day" && <OperationalDayPage stationId={stationId} />}
        {stationId && tab === "pump-assignments" && <PumpAssignmentsPage stationId={stationId} />}
        {stationId && tab === "worker-closing" && <WorkerClosingPage stationId={stationId} />}
        {stationId && tab === "deliveries" && <DeliveriesPage stationId={stationId} />}
        {stationId && tab === "tanks" && <StorageTanksPage stationId={stationId} />}
        {stationId && tab === "distribution" && <DistributionVehiclePage stationId={stationId} />}
        {stationId && tab === "reports" && <ReportsPage stationId={stationId} />}
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
const menuBtn = { width: "100%", marginBottom: 8, padding: 10, textAlign: "right", border: "none", borderRadius: 6 };
const logoutBtn = { width: "100%", padding: 10, marginTop: 10, background: "#dc2626", color: "#fff", border: "none", borderRadius: 6 };
const select = { width: "100%", padding: 10, marginBottom: 10 };

export default Dashboard;
