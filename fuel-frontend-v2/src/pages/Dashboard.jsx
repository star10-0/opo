import { useEffect, useMemo, useState } from "react";
import { stationApi, reportsApi, storageTanksApi, deliveriesApi, workerClosingsApi, approvalsApi } from "../api";
import { can, canAny } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";
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

const roleLabels = {
  admin: "مدير النظام",
  manager: "مدير محطة",
  accountant: "محاسب",
  worker: "عامل",
};

const rolePrimaryFlow = {
  admin: ["operational-day", "tanks", "reports", "approvals"],
  manager: ["operational-day", "pump-assignments", "worker-closing", "reports"],
  accountant: ["worker-closing", "deliveries", "reports", "approvals"],
  worker: ["pump-assignments", "worker-closing", "deliveries"],
};

const roleNextSteps = {
  admin: ["اختيار المحطة النشطة", "مراجعة حالة اليوم التشغيلي", "متابعة الخزانات والتقارير"],
  manager: ["اختيار المحطة النشطة", "بدء/مراجعة اليوم التشغيلي", "متابعة استلامات المضخات"],
  accountant: ["اختيار المحطة النشطة", "مراجعة إغلاقات العاملين", "فتح التقارير ومراجعة الفروقات"],
  worker: ["اختيار المحطة النشطة", "فتح استلام المضخة", "إرسال الإغلاق للمحاسب بعد نهاية الوردية"],
};

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
    { key: "notifications", label: t("notifications"), visible: true },
  ], [t]);

  const visibleTabs = useMemo(() => {
    const base = tabs.filter((x) => x.visible || role === "admin");
    const preferred = rolePrimaryFlow[role] || [];
    const rank = new Map(preferred.map((key, index) => [key, index + 1]));
    return [...base].sort((a, b) => (rank.get(a.key) || 999) - (rank.get(b.key) || 999));
  }, [tabs, role]);

  const [tab, setTab] = useState("dashboard");
  const [stationsState, setStationsState] = useState({ loading: true, error: "", items: [], totalStations: 0 });
  const [stationId, setStationId] = useState(localStorage.getItem("stationId") || "");
  const [summary, setSummary] = useState({ loading: true, error: "", data: null });
  const [createState, setCreateState] = useState({
    loading: false,
    error: "",
    success: "",
    form: {
      name: "",
      code: "",
      address: "",
      phone: "",
      withBootstrapData: true,
      fuelType: "diesel",
      tanksCount: 1,
      pumpsCount: 1,
    },
  });

  const canCreateStation = canAny(["manage_stations", "view_all_stations"]) || ["admin", "manager"].includes(role);

  useEffect(() => {
    if (!visibleTabs.some((x) => x.key === tab)) {
      setTab(visibleTabs[0]?.key || "dashboard");
    }
  }, [visibleTabs, tab]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const loadStations = async () => {
    setStationsState({ loading: true, error: "", items: [], totalStations: 0 });
    try {
      const data = await stationApi.allowed();
      const list = Array.isArray(data) ? data : data?.items || [];
      const totalStations = data?.meta?.totalStations ?? list.length;

      setStationsState({ loading: false, error: "", items: list, totalStations });

      const stored = localStorage.getItem("stationId") || "";
      const hasStored = stored && list.some((s) => s._id === stored);
      if (hasStored) {
        setStationId(stored);
        return;
      }

      if (list.length === 1) {
        setStationId(list[0]._id);
        localStorage.setItem("stationId", list[0]._id);
      } else {
        setStationId("");
        localStorage.removeItem("stationId");
      }
    } catch (error) {
      setStationsState({ loading: false, error: error.message || "تعذر تحميل المحطات", items: [], totalStations: 0 });
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (!stationId) {
      setSummary({ loading: false, error: "", data: null });
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

  const roleHint = useMemo(() => {
    if (role === "worker") return "ابدأ من استلامات المضخات ثم أرسل إغلاقك للمحاسب.";
    if (role === "accountant") return "راجع الإغلاقات المرسلة ثم افتح التقارير للتسوية.";
    return "ابدأ من اليوم التشغيلي، ثم راقب الخزانات والإغلاقات قبل التقارير.";
  }, [role]);

  const quickSteps = roleNextSteps[role] || roleNextSteps.worker;

  const renderHome = () => {
    if (summary.loading) return <LoadingState text="جارٍ تحميل مؤشرات لوحة التحكم..." />;
    if (summary.error && !summary.data) return <ErrorState error={summary.error} />;
    if (!summary.data) return <EmptyState text={t("noData")} />;

    const [daily, weekly, monthly, variances, vehicle, tankDelivery, tanks, deliveries, suspended, approvals] = summary.data;
    return (
      <div>
        <section style={onboardingCard}>
          <h3 style={{ margin: "0 0 8px" }}>خطوة اليوم المقترحة</h3>
          <p style={{ margin: 0, color: "#475569" }}>{roleHint}</p>
          <ul style={{ margin: "10px 0 0", color: "#334155", paddingInlineStart: 20 }}>
            {quickSteps.map((step) => <li key={step}>{step}</li>)}
          </ul>
        </section>
        {summary.error ? <ErrorState error={summary.error} /> : null}
        <div style={grid}>
          <Card title="إجمالي اليوم" value={daily?.totals?.totalAmount ?? "--"} />
          <Card title="مقارنة أسبوعية" value={weekly?.comparisons?.salesDelta ?? "--"} />
          <Card title="مقارنة شهرية" value={monthly?.comparisons?.salesDelta ?? "--"} />
          <Card title="ملخص الخزانات" value={tankDelivery?.totals?.tankCurrentQuantity ?? "--"} />
          <Card title="سيارات التوزيع" value={vehicle?.totals?.totalAmount ?? "--"} />
          <Card title="ملخص الفروقات" value={variances?.totals?.totalVariance ?? "--"} />
          <Card title="موافقات معلقة" value={Array.isArray(approvals) ? approvals.length : approvals?.items?.length ?? "--"} />
          <Card title="إغلاقات معلقة/موقوفة" value={Array.isArray(suspended) ? suspended.length : suspended?.items?.length ?? "--"} />
          <Card title="عدد الخزانات" value={Array.isArray(tanks) ? tanks.length : "--"} />
          <Card title="آخر الصهاريج" value={Array.isArray(deliveries) ? deliveries.length : deliveries?.items?.length ?? "--"} />
        </div>
      </div>
    );
  };

  const buildInitialRows = (prefix, count, fuelType) => {
    const safeCount = Math.max(0, Math.min(5, Number(count || 0)));
    return Array.from({ length: safeCount }).map((_, index) => {
      const number = index + 1;
      return {
        fuelType,
        [`${prefix}Name`]: `${prefix === "tank" ? "خزان" : "مضخة"} ${number}`,
        [`${prefix}Code`]: `${createState.form.code || "ST"}-${prefix === "tank" ? "T" : "P"}${String(number).padStart(2, "0")}`,
      };
    });
  };

  const createFirstStation = async (e) => {
    e.preventDefault();
    const code = createState.form.code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{2,20}$/.test(code)) {
      setCreateState((s) => ({ ...s, error: "كود المحطة يجب أن يكون بين 2 و20 حرفًا/رقمًا (A-Z, 0-9, -).", success: "" }));
      return;
    }
    setCreateState((s) => ({ ...s, loading: true, error: "", success: "", form: { ...s.form, code } }));

    try {
      const payload = {
        name: createState.form.name.trim(),
        code,
        address: createState.form.address.trim(),
        phone: createState.form.phone.trim(),
      };

      if (createState.form.withBootstrapData) {
        payload.initialTanks = buildInitialRows("tank", createState.form.tanksCount, createState.form.fuelType).map((row) => ({
          tankName: row.tankName,
          tankCode: row.tankCode,
          fuelType: row.fuelType,
          capacityLiters: 10000,
          currentQuantityLiters: 0,
          lowLevelThreshold: 1000,
        }));

        payload.initialPumps = buildInitialRows("pump", createState.form.pumpsCount, createState.form.fuelType).map((row) => ({
          pumpName: row.pumpName,
          pumpCode: row.pumpCode,
          fuelType: row.fuelType,
        }));
      }

      const result = createState.form.withBootstrapData
        ? await stationApi.bootstrap(payload)
        : { station: await stationApi.create(payload) };

      const newStationId = result?.station?._id || result?._id;
      if (newStationId) {
        localStorage.setItem("stationId", newStationId);
        setStationId(newStationId);
      }

      setCreateState((s) => ({ ...s, loading: false, success: "تم إنشاء المحطة بنجاح. الخطوة التالية: راجع المضخات والخزانات.", error: "" }));
      await loadStations();
      setTab("tanks");
    } catch (error) {
      setCreateState((s) => ({ ...s, loading: false, error: error.message || "فشل إنشاء المحطة", success: "" }));
    }
  };

  const renderOnboarding = () => {
    if (stationsState.loading) return <LoadingState text="جارٍ تحميل المحطات..." />;
    if (stationsState.error) return <ErrorState error={stationsState.error} />;

    if (stationsState.totalStations === 0) {
      if (!canCreateStation) {
        return <EmptyState text="لا توجد أي محطة في النظام حتى الآن، ولا تملك صلاحية إنشاء محطة. يرجى التواصل مع المدير." />;
      }

      return (
        <div style={onboardingCard}>
          <h3 style={{ marginTop: 0 }}>مرحبًا بك 👋</h3>
          <p>ابدأ بإنشاء أول محطة. بعد الإنشاء سيتم توجيهك مباشرة إلى الخزانات.</p>
          <form onSubmit={createFirstStation} style={{ display: "grid", gap: 8 }}>
            <input required placeholder="اسم المحطة (مثال: محطة الشمال)" value={createState.form.name} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, name: e.target.value } }))} />
            <input required placeholder="كود المحطة (مثال: N-001)" value={createState.form.code} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, code: e.target.value.toUpperCase() } }))} />
            <input placeholder="العنوان (اختياري)" value={createState.form.address} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, address: e.target.value } }))} />
            <input placeholder="الهاتف (اختياري)" value={createState.form.phone} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, phone: e.target.value } }))} />
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={createState.form.withBootstrapData} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, withBootstrapData: e.target.checked } }))} />
              إنشاء بيانات بدء مبدئية (خزانات ومضخات)
            </label>
            {createState.form.withBootstrapData ? (
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                <select value={createState.form.fuelType} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, fuelType: e.target.value } }))}>
                  <option value="diesel">ديزل</option>
                  <option value="gasoline">بنزين</option>
                  <option value="kerosene">كيروسين</option>
                </select>
                <input type="number" min="1" max="5" value={createState.form.tanksCount} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, tanksCount: Number(e.target.value || 1) } }))} placeholder="عدد الخزانات (1-5)" />
                <input type="number" min="1" max="5" value={createState.form.pumpsCount} onChange={(e) => setCreateState((s) => ({ ...s, form: { ...s.form, pumpsCount: Number(e.target.value || 1) } }))} placeholder="عدد المضخات (1-5)" />
              </div>
            ) : null}
            <ErrorState error={createState.error} />
            <SuccessState message={createState.success} />
            <button disabled={createState.loading} type="submit">{createState.loading ? "جارٍ الإنشاء..." : "إنشاء أول محطة"}</button>
          </form>
        </div>
      );
    }

    if (!stationsState.items.length) {
      return <EmptyState text="توجد محطات في النظام لكن حسابك غير مرتبط بأي محطة. اطلب من المدير إضافتك إلى محطة." />;
    }

    return (
      <div style={onboardingCard}>
        <h3 style={{ marginTop: 0 }}>اختر محطة للمتابعة</h3>
        <p>الخطوة التالية: اختر المحطة الحالية ثم افتح اليوم التشغيلي.</p>
        <ul style={{ marginTop: 0, color: "#334155", paddingInlineStart: 20 }}>
          {quickSteps.map((step) => <li key={`onboard-${step}`}>{step}</li>)}
        </ul>
        <select value={stationId} onChange={(e) => { setStationId(e.target.value); localStorage.setItem("stationId", e.target.value); }} style={select}>
          <option value="">-- اختر محطة --</option>
          {stationsState.items.map((s) => <option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="dashboard-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="dashboard-sidebar" style={sidebar}>
        <h2 style={{ marginBottom: 6 }}>{t("dashboard")}</h2>
        <p style={{ margin: "0 0 4px" }}>{userName}</p>
        <small style={{ color: "#cbd5e1" }}>{roleLabels[role] || role}</small>
        <label style={{ marginTop: 10, display: "block" }}>{t("language")}</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={select}>
          <option value="ar">{t("arabic")}</option>
          <option value="en">{t("english")}</option>
        </select>

        <select value={stationId} onChange={(e) => { setStationId(e.target.value); localStorage.setItem("stationId", e.target.value); }} style={select}>
          <option value="">{t("selectStation")}</option>
          {stationsState.items.map((s) => <option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>)}
        </select>

        {visibleTabs.map((tabItem) => (
          <button key={tabItem.key} style={{ ...menuBtn, background: tab === tabItem.key ? "#0f766e" : "#1f2937" }} onClick={() => setTab(tabItem.key)}>{tabItem.label}</button>
        ))}
        <button style={logoutBtn} onClick={logout}>{t("logout")}</button>
      </aside>
      <main className="dashboard-main" style={{ flex: 1, padding: 20 }}>
        {!stationId ? renderOnboarding() : null}
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
  return <div style={card}><div style={{ color: "#475569", marginBottom: 6 }}>{title}</div><strong>{value}</strong></div>;
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 12 };
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 };
const onboardingCard = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, maxWidth: 700, marginBottom: 12 };
const sidebar = { width: 280, background: "#111827", color: "#fff", padding: 16 };
const menuBtn = { width: "100%", marginBottom: 8, padding: 10, textAlign: "start", border: "1px solid #374151", borderRadius: 6 };
const logoutBtn = { width: "100%", padding: 10, marginTop: 10, background: "#dc2626", color: "#fff", border: "none", borderRadius: 6 };
const select = { width: "100%", margin: "8px 0" };

export default Dashboard;
