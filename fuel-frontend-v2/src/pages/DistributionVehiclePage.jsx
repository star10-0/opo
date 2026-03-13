import { useEffect, useState } from "react";
import { distributionVehicleApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";

function DistributionVehiclePage({ stationId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [sessions, setSessions] = useState([]);

  const load = async () => {
    if (!stationId) return;
    setLoading(true);
    setError("");
    const [v, s] = await Promise.allSettled([
      distributionVehicleApi.listVehicles(stationId),
      distributionVehicleApi.listSessions({ stationId })
    ]);
    if (v.status === "fulfilled") setVehicles(v.value?.items || v.value || []);
    if (s.status === "fulfilled") setSessions(s.value?.items || s.value || []);
    if (v.status === "rejected" || s.status === "rejected") setError("بعض بيانات سيارات التوزيع غير متاحة (TODO backend)");
    setLoading(false);
  };

  useEffect(() => { load(); }, [stationId]);

  if (loading) return <LoadingState />;
  return (
    <div>
      <h3>سيارة التوزيع</h3>
      <p style={{ color: "#64748b", marginTop: 0 }}>تابع السيارات النشطة والجلسات اليومية لمعرفة أداء البيع خارج المضخات.</p>
      {error ? <ErrorState error={error} /> : null}
      {vehicles.length === 0 ? <EmptyState text="لا توجد سيارات توزيع بعد. أضف سيارة توزيع من إعدادات التشغيل" /> : vehicles.map((v) => <div key={v._id}>{v.vehicleName} ({v.vehicleCode})</div>)}
      <h4>جلسات العمل</h4>
      {sessions.length === 0 ? <EmptyState text="لا توجد جلسات" /> : sessions.map((s) => (
        <div key={s._id} style={{ border: "1px solid #e2e8f0", padding: 8, marginBottom: 6 }}>
          <div>السيارة: {s.vehicleId?.vehicleName || s.vehicleId}</div>
          <div>قراءة البداية: {s.openingReading ?? "--"}</div>
          <div>قراءة النهاية: {s.closingReading ?? "--"}</div>
          <div>المبيعات اليومية: {s.totalAmount ?? "--"}</div>
        </div>
      ))}
    </div>
  );
}

export default DistributionVehiclePage;
