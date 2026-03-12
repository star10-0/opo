import { useEffect, useState } from "react";
import { deliveriesApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function DeliveriesPage({ stationId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({ search: "", monthKey: "" });

  const load = async () => {
    if (!stationId) return;
    setLoading(true);
    setError("");
    try {
      const data = await deliveriesApi.list({ stationId, ...filters });
      setRows(data?.items || data || []);
    } catch (e) {
      setRows([]);
      setError(e.message || "فشل تحميل الصهاريج");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [stationId, filters.search, filters.monthKey]);

  const createDemo = async () => {
    try {
      await deliveriesApi.create({ stationId, fuelType: "diesel", quantityLiters: 1000, deliveryDate: new Date().toISOString() });
      setSuccess("تمت إضافة الصهريج");
      load();
    } catch (e) {
      setError(e.message || "فشل الإضافة");
    }
  };

  const remove = async (id) => {
    try {
      await deliveriesApi.softDelete(id);
      setSuccess("تم الحذف المنطقي");
      load();
    } catch (e) {
      setError(e.message || "فشل الحذف");
    }
  };

  return (
    <div>
      <h3>Deliveries</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input placeholder="بحث" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        <input placeholder="monthKey مثل 2026-03" value={filters.monthKey} onChange={(e) => setFilters((f) => ({ ...f, monthKey: e.target.value }))} />
        {can("register_delivery") || can("manage_deliveries") ? <button onClick={createDemo}>إضافة صهريج</button> : null}
      </div>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      <SuccessState message={success} />
      {!loading && rows.length === 0 ? <EmptyState text="لا توجد سجلات صهاريج" /> : (
        <table style={{ width: "100%" }}><thead><tr><th>التاريخ</th><th>الشهر</th><th>السائق</th><th>رقم الشاحنة</th><th>الكمية</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{r.deliveryDate || "--"}</td><td>{r.monthKey || "--"}</td><td>{r.driverName || "--"}</td><td>{r.truckNumber || "--"}</td><td>{r.quantityLiters || "--"}</td><td>{r.approvalStatus || "--"}</td>
              <td>
                {(can("manage_deliveries") && !r.isDeleted) ? <button onClick={() => remove(r._id)}>حذف منطقي</button> : null}
              </td>
            </tr>
          ))}
        </tbody></table>
      )}
    </div>
  );
}

export default DeliveriesPage;
