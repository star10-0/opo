import { useEffect, useMemo, useState } from "react";
import { workerClosingsApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function WorkerClosingPage({ stationId }) {
  const [filters, setFilters] = useState({ status: "", workerId: "" });
  const [state, setState] = useState({ loading: true, error: "", success: "", items: [] });
  const [submitState, setSubmitState] = useState({ loading: false, id: "" });

  const load = async () => {
    if (!stationId) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await workerClosingsApi.list({ stationId, status: filters.status, limit: 120 });
      setState({ loading: false, error: "", success: "", items: data?.items || data || [] });
    } catch (e) {
      setState({ loading: false, error: e.message || "فشل تحميل حسابات العامل", success: "", items: [] });
    }
  };

  useEffect(() => { load(); }, [stationId, filters.status]);

  const filteredItems = useMemo(
    () => {
      const search = filters.workerId.trim().toLowerCase();
      return state.items.filter((w) => {
        if (!search) return true;
        const workerName = String(w.primaryWorkerId?.name || "").toLowerCase();
        const workerId = String(w.primaryWorkerId?._id || w.primaryWorkerId || "").toLowerCase();
        return workerName.includes(search) || workerId.includes(search);
      });
    },
    [state.items, filters.workerId]
  );

  const submit = async (id) => {
    setSubmitState({ loading: true, id });
    try {
      await workerClosingsApi.submit(id);
      setState((s) => ({ ...s, success: "تم إرسال الحساب للمحاسب" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || "فشل الإرسال" }));
    } finally {
      setSubmitState({ loading: false, id: "" });
    }
  };

  const printPage = () => window.print();

  if (state.loading) return <LoadingState />;
  return (
    <div>
      <h3>إغلاقات العمال</h3>
      <p style={{ color: "#64748b", marginTop: 0 }}>راجع الحالات بسرعة، ثم أرسل الحساب غير المؤرشف للمحاسب.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <select value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="submitted">مرسل للمحاسب</option>
          <option value="archived">مؤرشف</option>
          <option value="suspended">معلق</option>
        </select>
        <input placeholder="فلترة حسب اسم/معرّف العامل" value={filters.workerId} onChange={(e) => setFilters((s) => ({ ...s, workerId: e.target.value }))} />
        <button onClick={printPage}>طباعة حساب العامل</button>
        <button onClick={printPage}>طباعة تقرير المحاسب</button>
        <button onClick={load}>تحديث</button>
      </div>
      {state.error ? <ErrorState error={state.error} /> : null}
      <SuccessState message={state.success} />
      {filteredItems.length === 0 ? <EmptyState text="لا توجد حسابات مطابقة للفلاتر الحالية." /> : filteredItems.map((w) => {
        const locked = ["archived", "approval_pending", "suspended"].includes(w.status);
        return (
          <div key={w._id} style={{ background: "#fff", marginBottom: 10, padding: 10, border: "1px solid #e2e8f0" }}>
            <div>الكمية المباعة: {w.totalSoldLiters ?? "--"}</div>
            <div>الإيراد الإجمالي: {w.grossSalesAmount ?? "--"}</div>
            <div>المصاريف: {w.expenseAmount ?? "--"}</div>
            <div>النقد المتوقع: {w.expectedCash ?? "--"}</div>
            <div>النقد الفعلي: {w.actualCash ?? "--"}</div>
            <div>الفرق: {w.variance ?? "--"}</div>
            <div>حالة الحساب: {w.status}</div>
            {locked ? <small style={{ color: "#b45309" }}>هذا الحساب مؤرشف/معلق ولا يقبل التعديل المباشر.</small> : null}
            {can("submit_own_closing") && !locked ? (
              <button disabled={submitState.loading} onClick={() => submit(w._id)}>
                {submitState.loading && submitState.id === w._id ? "جارٍ الإرسال..." : "إرسال للمحاسب"}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default WorkerClosingPage;
