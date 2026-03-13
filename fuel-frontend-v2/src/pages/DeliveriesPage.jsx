import { useEffect, useState } from "react";
import { deliveriesApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function DeliveriesPage({ stationId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({ search: "", monthKey: "", fuelType: "", from: "", to: "" });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedFilters(filters), 350);
    return () => clearTimeout(timeout);
  }, [filters]);

  const load = async () => {
    if (!stationId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await deliveriesApi.list({ stationId, ...debouncedFilters });
      setRows(data?.items || data || []);
    } catch (e) {
      setRows([]);
      setError(e.message || "فشل تحميل الصهاريج");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [stationId, debouncedFilters.search, debouncedFilters.monthKey, debouncedFilters.fuelType, debouncedFilters.from, debouncedFilters.to]);

  const createDemo = async () => {
    try {
      await deliveriesApi.create({ stationId, fuelType: "diesel", quantityLiters: 1000, deliveryDate: new Date().toISOString(), monthKey: new Date().toISOString().slice(0, 7) });
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
      <h3>الصهاريج</h3>
      <div style={{ display: "grid", gap: 8, marginBottom: 8, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <input placeholder="بحث" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        <input placeholder="رمز الشهر مثل 2026-03" value={filters.monthKey} onChange={(e) => setFilters((f) => ({ ...f, monthKey: e.target.value }))} />
        <select value={filters.fuelType} onChange={(e) => setFilters((f) => ({ ...f, fuelType: e.target.value }))}>
          <option value="">كل أنواع الوقود</option>
          <option value="diesel">ديزل</option>
          <option value="gasoline">بنزين</option>
          <option value="kerosene">كيروسين</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
        <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
        {can("register_delivery") || can("manage_deliveries") ? <button onClick={createDemo}>إضافة صهريج</button> : null}
      </div>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      <SuccessState message={success} />
      {!loading && rows.length === 0 ? <EmptyState text="لا توجد سجلات صهاريج أو أرشيف مطابق للفلاتر" /> : (
        <table style={{ width: "100%" }}><thead><tr><th>التاريخ</th><th>الشهر</th><th>نوع الوقود</th><th>السائق</th><th>رقم الشاحنة</th><th>الكمية</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{r.deliveryDate || "--"}</td><td>{r.monthKey || "--"}</td><td>{r.fuelType || "--"}</td><td>{r.driverName || "--"}</td><td>{r.truckNumber || "--"}</td><td>{r.quantityLiters || "--"}</td><td>{r.approvalStatus || "--"}</td>
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
