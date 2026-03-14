import { useEffect, useMemo, useState } from "react";
import { reportsApi, automationApi, stationApi } from "../api";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ReportsPage({ stationId }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const defaultMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [filters, setFilters] = useState({ stationId, from: weekStart, to: today, date: today, monthKey: defaultMonthKey, fuelType: "", workerId: "", searchText: "" });
  const [state, setState] = useState({ loading: true, error: "", success: "", data: {} });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, stationId }));
  }, [stationId]);

  const monthValid = /^\d{4}-(0[1-9]|1[0-2])$/.test(filters.monthKey);
  const rangeValid = !filters.from || !filters.to || filters.from <= filters.to;

  const query = useMemo(() => ({
    ...(filters.stationId === "__all__" ? { stationIds: "__all__" } : { stationId: filters.stationId }),
    from: filters.from,
    to: filters.to,
    date: filters.date,
    monthKey: filters.monthKey,
    fuelType: filters.fuelType,
    workerId: filters.workerId,
  }), [filters]);

  const load = async () => {
    if (!filters.stationId) return;
    if (!monthValid || !rangeValid) {
      setState((s) => ({ ...s, error: !monthValid ? "الشهر يجب أن يكون بصيغة YYYY-MM." : "تحقق من نطاق التاريخ: البداية يجب أن تكون قبل النهاية." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    const normalizedQuery = { ...query };
    if (normalizedQuery.stationIds === "__all__") delete normalizedQuery.stationIds;

    const requests = await Promise.allSettled([
      reportsApi.daily(normalizedQuery),
      reportsApi.weekly(normalizedQuery),
      reportsApi.monthly(normalizedQuery),
      reportsApi.variances(normalizedQuery),
      reportsApi.distributionVehicle(normalizedQuery),
      reportsApi.deliveriesTanks(normalizedQuery),
      reportsApi.analyticsOverview(normalizedQuery),
      reportsApi.enterpriseOversight({ ...normalizedQuery, daysBack: 7 }),
      automationApi.integrationCatalog(),
      filters.stationId === "__all__" ? Promise.resolve(null) : automationApi.pendingReviewReminders({ stationId: filters.stationId }),
      filters.stationId === "__all__" ? Promise.resolve(null) : stationApi.customization(filters.stationId),
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
        analytics: requests[6].status === "fulfilled" ? requests[6].value : null,
        enterprise: requests[7].status === "fulfilled" ? requests[7].value : null,
        integrationCatalog: requests[8].status === "fulfilled" ? requests[8].value : null,
        pendingReviewReminders: requests[9].status === "fulfilled" ? requests[9].value : null,
        customization: requests[10].status === "fulfilled" ? requests[10].value : null,
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
  const { daily, weekly, monthly, variances, vehicle, deliveriesTanks, analytics, enterprise, integrationCatalog, pendingReviewReminders, customization } = state.data;

  return (
    <div>
      <h3>التقارير النهائية</h3>
      <p style={{ color: "#64748b", marginTop: 0 }}>راجع النطاق الزمني بدقة ثم حدّث التقارير. يمكنك الطباعة أو التصدير CSV من كل قسم.</p>
      <div style={filtersGrid}>
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
        <input value={filters.searchText} placeholder="بحث داخل النتائج" onChange={(e) => setFilters((s) => ({ ...s, searchText: e.target.value }))} />
        <button onClick={load}>تحديث التقارير</button>
      </div>

      <ErrorState error={state.error} />
      <SuccessState message={state.success} />
      {!daily && !weekly && !monthly && !variances && !vehicle && !deliveriesTanks ? <EmptyState text="لا توجد تقارير متاحة. اختر نطاقًا أوسع أو تأكد من وجود يوم تشغيلي." /> : null}

      <ReportBlock id="daily-report" title="التقرير اليومي" report={daily} searchText={filters.searchText} onPrint={() => printSection("daily-report")} onExport={() => exportCsv("daily")} />
      <ReportBlock id="weekly-report" title="التقرير الأسبوعي" report={weekly} searchText={filters.searchText} onExport={() => exportCsv("weekly")} />
      <ReportBlock id="monthly-report" title="التقرير الشهري" report={monthly} searchText={filters.searchText} onExport={() => exportCsv("monthly")} />
      <ReportBlock id="variance-report" title="تقرير الفروقات" report={variances} searchText={filters.searchText} onExport={() => exportCsv("variances")} />
      <ReportBlock id="vehicle-report" title="تقرير سيارة التوزيع" report={vehicle} searchText={filters.searchText} onExport={() => exportCsv("distributionVehicle")} />
      <ReportBlock id="tanks-report" title="تقرير ملخص الصهاريج والخزانات" report={deliveriesTanks} searchText={filters.searchText} onPrint={() => printSection("tanks-report")} onExport={() => exportCsv("deliveriesTanks")} />

      {analytics ? (
        <section style={card}>
          <strong>مؤشرات تحليلية متقدمة</strong>
          <pre style={pre}>{JSON.stringify({ kpis: analytics.kpis, stationsScope: analytics.stationsScope, topVarianceRows: analytics.topVarianceRows }, null, 2)}</pre>
        </section>
      ) : null}

      {enterprise ? (
        <section style={card}>
          <strong>جاهزية الإدارة المركزية</strong>
          <pre style={pre}>{JSON.stringify({ summary: enterprise.summary, topStations: enterprise.stations?.slice(0, 3) }, null, 2)}</pre>
        </section>
      ) : null}

      {integrationCatalog ? (
        <section style={card}>
          <strong>جاهزية التكاملات المؤسسية</strong>
          <pre style={pre}>{JSON.stringify(integrationCatalog, null, 2)}</pre>
        </section>
      ) : null}

      {pendingReviewReminders ? (
        <section style={card}>
          <strong>تنبيهات تشغيلية مخصصة للمحطة</strong>
          <pre style={pre}>{JSON.stringify({ thresholds: pendingReviewReminders.thresholds, totals: pendingReviewReminders.totals, reminders: pendingReviewReminders.reminders?.slice(0, 10) }, null, 2)}</pre>
        </section>
      ) : null}

      {customization ? (
        <section style={card}>
          <strong>إعدادات التخصيص المعتمدة</strong>
          <pre style={pre}>{JSON.stringify(customization.projectCustomization || {}, null, 2)}</pre>
        </section>
      ) : null}

      <div style={actionsBar}>
        <button onClick={() => printSection("daily-report")}>طباعة التقرير اليومي</button>
        <button onClick={() => printSection("variance-report")}>طباعة حساب العامل</button>
        <button onClick={() => printSection("monthly-report")}>طباعة تقرير المحاسب</button>
        <button onClick={() => printSection("tanks-report")}>طباعة سجل الصهاريج</button>
      </div>
    </div>
  );
}

function ReportBlock({ id, title, report, searchText = "", onPrint, onExport }) {
  const term = String(searchText || "").trim().toLowerCase();
  const items = report?.items || report?.deliveries || [];
  const filteredItems = !term ? items : items.filter((row) => Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(term)));
  const renderPayload = report
    ? { ...report, items: report.items ? filteredItems : report.items, deliveries: report.deliveries ? filteredItems : report.deliveries }
    : report;

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
          <pre style={pre}>{JSON.stringify(renderPayload?.totals || renderPayload, null, 2)}</pre>
          <small>عدد السجلات: {filteredItems.length}</small>
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
