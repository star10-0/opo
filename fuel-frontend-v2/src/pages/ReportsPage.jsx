import { useEffect, useMemo, useState } from "react";
import { reportsApi, stationApi } from "../api";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ReportsPage({ stationId }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const defaultMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({ stationId, stationMode: "active", from: weekStart, to: today, date: today, monthKey: defaultMonthKey, fuelType: "", workerId: "", searchText: "" });
  const [state, setState] = useState({ loading: true, error: "", success: "", data: {} });

  useEffect(() => {
    stationApi.allowed().then((data) => setStations(Array.isArray(data) ? data : data?.items || [])).catch(() => setStations([]));
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, stationId }));
  }, [stationId]);

  const monthValid = /^\d{4}-(0[1-9]|1[0-2])$/.test(filters.monthKey);
  const rangeValid = !filters.from || !filters.to || filters.from <= filters.to;

  const query = useMemo(() => {
    const stationIds = filters.stationMode === "all" ? stations.map((s) => s._id).filter(Boolean).join(",") : filters.stationId;
    return {
      stationId: stationIds,
      from: filters.from,
      to: filters.to,
      date: filters.date,
      monthKey: filters.monthKey,
      fuelType: filters.fuelType,
      workerId: filters.workerId,
    };
  }, [filters, stations]);

  const load = async () => {
    if (!query.stationId) return;
    if (!monthValid || !rangeValid) {
      setState((s) => ({ ...s, error: !monthValid ? "الشهر يجب أن يكون بصيغة YYYY-MM." : "تحقق من نطاق التاريخ: البداية يجب أن تكون قبل النهاية." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    const requests = await Promise.allSettled([
      reportsApi.daily(query),
      reportsApi.weekly(query),
      reportsApi.monthly(query),
      reportsApi.variances(query),
      reportsApi.distributionVehicle(query),
      reportsApi.deliveriesTanks(query),
    ]);

    setState({
      loading: false,
      error: requests.some((r) => r.status === "rejected") ? "تعذر تحميل بعض التقارير، تم عرض المتاح." : "",
      success: "",
      data: {
        daily: requests[0].status === "fulfilled" ? requests[0].value : null,
        weekly: requests[1].status === "fulfilled" ? requests[1].value : null,
        monthly: requests[2].status === "fulfilled" ? requests[2].value : null,
        variances: requests[3].status === "fulfilled" ? requests[3].value : null,
        vehicle: requests[4].status === "fulfilled" ? requests[4].value : null,
        deliveriesTanks: requests[5].status === "fulfilled" ? requests[5].value : null,
      },
    });
  };

  useEffect(() => { load(); }, [query.stationId]);

  const printSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`<html dir="rtl"><head><title>طباعة تقرير</title></head><body>${section.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const exportCsv = async (reportType) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${apiBaseUrl}${reportsApi.exportCsvUrl({ ...query, reportType })}`;
      const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error("فشل التصدير");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${reportType}-report.csv`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      setState((s) => ({ ...s, success: "تم تصدير CSV بنجاح" }));
    } catch (error) {
      setState((s) => ({ ...s, error: error.message || "فشل التصدير" }));
    }
  };

  if (state.loading) return <LoadingState />;
  const { daily, weekly, monthly, variances, vehicle, deliveriesTanks } = state.data;

  const reportBlocks = [
    { id: "daily-report", title: "التقرير اليومي", report: daily, reportKey: "daily", canPrint: true },
    { id: "weekly-report", title: "التقرير الأسبوعي", report: weekly, reportKey: "weekly" },
    { id: "monthly-report", title: "التقرير الشهري", report: monthly, reportKey: "monthly" },
    { id: "variance-report", title: "تقرير الفروقات", report: variances, reportKey: "variances" },
    { id: "vehicle-report", title: "تقرير سيارة التوزيع", report: vehicle, reportKey: "distributionVehicle" },
    { id: "tanks-report", title: "تقرير ملخص الصهاريج والخزانات", report: deliveriesTanks, reportKey: "deliveriesTanks", canPrint: true },
  ].filter((block) => block.title.toLowerCase().includes(filters.searchText.trim().toLowerCase()));

  const kpis = monthly?.kpis || weekly?.kpis || daily?.kpis;

  return (
    <div>
      <h3>التقارير النهائية</h3>
      <p style={{ color: "#64748b", marginTop: 0 }}>دعم تحليلات أعمق بعد الاستقرار: KPI إضافية + تجميع متعدد المحطات + بحث داخل التقارير.</p>
      <div style={filtersGrid}>
        <select value={filters.stationMode} onChange={(e) => setFilters((s) => ({ ...s, stationMode: e.target.value }))}>
          <option value="active">المحطة الحالية</option>
          <option value="all">كل المحطات المتاحة</option>
        </select>
        <input type="date" aria-label="تاريخ التقرير اليومي" value={filters.date} onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))} />
        <input type="date" aria-label="من تاريخ" value={filters.from} onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))} />
        <input type="date" aria-label="إلى تاريخ" value={filters.to} onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))} />
        <input value={filters.monthKey} placeholder="الشهر (YYYY-MM)" onChange={(e) => setFilters((s) => ({ ...s, monthKey: e.target.value }))} />
        <select value={filters.fuelType} onChange={(e) => setFilters((s) => ({ ...s, fuelType: e.target.value }))}>
          <option value="">كل أنواع الوقود</option>
          <option value="diesel">ديزل</option>
          <option value="gasoline">بنزين</option>
          <option value="kerosene">كيروسين</option>
        </select>
        <input value={filters.workerId} placeholder="معرّف العامل (اختياري)" onChange={(e) => setFilters((s) => ({ ...s, workerId: e.target.value }))} />
        <input value={filters.searchText} placeholder="بحث داخل أقسام التقرير" onChange={(e) => setFilters((s) => ({ ...s, searchText: e.target.value }))} />
        <button onClick={load}>تحديث التقارير</button>
      </div>

      {kpis ? (
        <div style={kpiGrid}>
          <Stat title="عدد الإغلاقات" value={kpis.closingsCount} />
          <Stat title="متوسط قيمة الإغلاق" value={Number(kpis.avgTicketAmount || 0).toFixed(2)} />
          <Stat title="معدل الفروقات" value={`${Number((kpis.varianceRate || 0) * 100).toFixed(1)}%`} />
          <Stat title="إغلاقات متوازنة" value={kpis.balancedClosingsCount} />
        </div>
      ) : null}

      <ErrorState error={state.error} />
      <SuccessState message={state.success} />
      {!daily && !weekly && !monthly && !variances && !vehicle && !deliveriesTanks ? <EmptyState text="لا توجد تقارير متاحة. اختر نطاقًا أوسع أو تأكد من وجود يوم تشغيلي." /> : null}

      {reportBlocks.map((block) => (
        <ReportBlock
          key={block.id}
          id={block.id}
          title={block.title}
          report={block.report}
          onPrint={block.canPrint ? () => printSection(block.id) : undefined}
          onExport={() => exportCsv(block.reportKey)}
        />
      ))}

      <div style={actionsBar}>
        <button onClick={() => printSection("daily-report")}>طباعة التقرير اليومي</button>
        <button onClick={() => printSection("variance-report")}>طباعة حساب العامل</button>
        <button onClick={() => printSection("monthly-report")}>طباعة تقرير المحاسب</button>
        <button onClick={() => printSection("tanks-report")}>طباعة سجل الصهاريج</button>
      </div>
    </div>
  );
}

function ReportBlock({ id, title, report, onPrint, onExport }) {
  return (
    <section id={id} style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <strong>{title}</strong>
        <div style={{ display: "flex", gap: 8 }}>
          {onPrint ? <button onClick={onPrint}>طباعة</button> : null}
          {onExport ? <button onClick={onExport}>CSV</button> : null}
        </div>
      </div>
      {!report ? <EmptyState text="لا توجد بيانات لهذا القسم" /> : (
        <>
          <pre style={pre}>{JSON.stringify(report.totals || report, null, 2)}</pre>
          {Array.isArray(report.stationBreakdown) && report.stationBreakdown.length ? (
            <pre style={pre}>{JSON.stringify(report.stationBreakdown, null, 2)}</pre>
          ) : null}
          <small>عدد السجلات: {report.items?.length || report.deliveries?.length || 0}</small>
        </>
      )}
    </section>
  );
}

function Stat({ title, value }) {
  return <div style={kpiCard}><small style={{ color: "#475569" }}>{title}</small><strong>{value}</strong></div>;
}

const card = { background: "#fff", marginBottom: 10, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 };
const pre = { background: "#f8fafc", padding: 10, borderRadius: 8, overflowX: "auto", fontSize: 12 };
const filtersGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8, marginBottom: 12 };
const actionsBar = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8, marginBottom: 12 };
const kpiCard = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, display: "grid", gap: 4 };

export default ReportsPage;
