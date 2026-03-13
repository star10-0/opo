import { useEffect, useMemo, useState } from "react";
import { reportsApi } from "../api";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ReportsPage({ stationId }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const defaultMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [filters, setFilters] = useState({
    stationId,
    from: weekStart,
    to: today,
    date: today,
    monthKey: defaultMonthKey,
    fuelType: "",
    workerId: "",
  });
  const [state, setState] = useState({ loading: true, error: "", success: "", data: {} });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, stationId }));
  }, [stationId]);

  const query = useMemo(() => ({
    stationId: filters.stationId,
    from: filters.from,
    to: filters.to,
    date: filters.date,
    monthKey: filters.monthKey,
    fuelType: filters.fuelType,
    workerId: filters.workerId,
  }), [filters]);

  const load = async () => {
    if (!filters.stationId) return;
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

  useEffect(() => { load(); }, [filters.stationId]);

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

  return (
    <div>
      <h3>التقارير النهائية</h3>
      <div style={filtersGrid}>
        <input type="date" value={filters.date} onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))} />
        <input type="date" value={filters.from} onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))} />
        <input type="date" value={filters.to} onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))} />
        <input value={filters.monthKey} placeholder="YYYY-MM" onChange={(e) => setFilters((s) => ({ ...s, monthKey: e.target.value }))} />
        <select value={filters.fuelType} onChange={(e) => setFilters((s) => ({ ...s, fuelType: e.target.value }))}>
          <option value="">كل أنواع الوقود</option>
          <option value="diesel">ديزل</option>
          <option value="gasoline">بنزين</option>
          <option value="kerosene">كيروسين</option>
        </select>
        <input value={filters.workerId} placeholder="workerId (اختياري)" onChange={(e) => setFilters((s) => ({ ...s, workerId: e.target.value }))} />
        <button onClick={load}>تحديث التقارير</button>
      </div>

      {state.error ? <ErrorState error={state.error} /> : null}
      <SuccessState message={state.success} />
      {!daily && !weekly && !monthly && !variances && !vehicle && !deliveriesTanks ? <EmptyState text="لا توجد تقارير متاحة" /> : null}

      <ReportBlock id="daily-report" title="التقرير اليومي" report={daily} onPrint={() => printSection("daily-report")} onExport={() => exportCsv("daily")} />
      <ReportBlock id="weekly-report" title="التقرير الأسبوعي" report={weekly} onExport={() => exportCsv("weekly")} />
      <ReportBlock id="monthly-report" title="التقرير الشهري" report={monthly} onExport={() => exportCsv("monthly")} />
      <ReportBlock id="variance-report" title="تقرير الفروقات" report={variances} onExport={() => exportCsv("variances")} />
      <ReportBlock id="vehicle-report" title="تقرير سيارة التوزيع" report={vehicle} onExport={() => exportCsv("distributionVehicle")} />
      <ReportBlock id="tanks-report" title="تقرير ملخص الصهاريج والخزانات" report={deliveriesTanks} onPrint={() => printSection("tanks-report")} onExport={() => exportCsv("deliveriesTanks")} />

      <div style={actionsBar}>
        <button onClick={() => printSection("daily-report")}>طباعة التقرير اليومي</button>
        <button onClick={() => printSection("variance-report")}>طباعة حساب العامل</button>
        <button onClick={() => printSection("monthly-report")}>طباعة تقرير المحاسب</button>
        <button onClick={() => printSection("tanks-report")}>طباعة سجل الصهاريج</button>
        <button onClick={async () => {
          try {
            await reportsApi.exportPdf(query);
          } catch {
            setState((s) => ({ ...s, error: "TODO: تصدير PDF الكامل غير مكتمل بعد، استخدم CSV حاليًا." }));
          }
        }}>تجربة PDF</button>
      </div>
    </div>
  );
}

function ReportBlock({ id, title, report, onPrint, onExport }) {
  return (
    <section id={id} style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <strong>{title}</strong>
        <div style={{ display: "flex", gap: 8 }}>
          {onPrint ? <button onClick={onPrint}>طباعة</button> : null}
          {onExport ? <button onClick={onExport}>CSV</button> : null}
        </div>
      </div>
      {!report ? <EmptyState text="لا توجد بيانات" /> : (
        <>
          <pre style={pre}>{JSON.stringify(report.totals || report, null, 2)}</pre>
          <small>حجم السجلات: {report.items?.length || report.deliveries?.length || 0}</small>
        </>
      )}
    </section>
  );
}

const card = { background: "#fff", marginBottom: 10, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 };
const pre = { background: "#f8fafc", padding: 10, borderRadius: 8, overflowX: "auto", fontSize: 12 };
const filtersGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8, marginBottom: 12 };
const actionsBar = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 };

export default ReportsPage;
