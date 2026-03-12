import { useEffect, useState } from "react";
import { reportsApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";

function ReportsPage({ stationId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);
    Promise.allSettled([
      reportsApi.daily(stationId, today),
      reportsApi.weekly(stationId, from, today),
      reportsApi.monthly(stationId, monthKey),
      reportsApi.variances(stationId, from, today),
      reportsApi.distributionVehicle(stationId, today)
    ]).then((result) => {
      setData({
        daily: result[0].status === "fulfilled" ? result[0].value : null,
        weekly: result[1].status === "fulfilled" ? result[1].value : null,
        monthly: result[2].status === "fulfilled" ? result[2].value : null,
        variances: result[3].status === "fulfilled" ? result[3].value : null,
        vehicle: result[4].status === "fulfilled" ? result[4].value : null
      });
      setError(result.some((r) => r.status === "rejected") ? "بعض التقارير غير متاحة حاليًا" : "");
      setLoading(false);
    });
  }, [stationId]);

  if (loading) return <LoadingState />;
  return (
    <div>
      <h3>التقارير</h3>
      {error ? <ErrorState error={error} /> : null}
      {!data.daily && !data.weekly && !data.monthly && !data.variances && !data.vehicle ? <EmptyState text="لا توجد تقارير متاحة" /> : null}
      <ReportCard title="تقرير يومي" report={data.daily} />
      <ReportCard title="تقرير أسبوعي" report={data.weekly} />
      <ReportCard title="تقرير شهري" report={data.monthly} />
      <ReportCard title="تقرير الفروقات" report={data.variances} />
      <ReportCard title="تقرير سيارة التوزيع" report={data.vehicle} />
    </div>
  );
}

function ReportCard({ title, report }) {
  return <div style={{ background: "#fff", marginBottom: 8, padding: 10, border: "1px solid #e2e8f0" }}><strong>{title}</strong><div>{report ? JSON.stringify(report?.totals || report) : "غير متاح"}</div></div>;
}

export default ReportsPage;
