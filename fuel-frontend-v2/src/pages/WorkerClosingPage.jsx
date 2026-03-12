import { useEffect, useState } from "react";
import { workerClosingsApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function WorkerClosingPage({ stationId }) {
  const [state, setState] = useState({ loading: true, error: "", success: "", items: [] });

  const load = async () => {
    if (!stationId) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await workerClosingsApi.list({ stationId });
      setState({ loading: false, error: "", success: "", items: data?.items || data || [] });
    } catch (e) {
      setState({ loading: false, error: e.message || "فشل تحميل حسابات العامل", success: "", items: [] });
    }
  };

  useEffect(() => { load(); }, [stationId]);

  const submit = async (id) => {
    try {
      await workerClosingsApi.submit(id);
      setState((s) => ({ ...s, success: "تم إرسال الحساب للمحاسب" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || "فشل الإرسال" }));
    }
  };

  if (state.loading) return <LoadingState />;
  return (
    <div>
      <h3>إغلاقات العمال</h3>
      {state.error ? <ErrorState error={state.error} /> : null}
      <SuccessState message={state.success} />
      {state.items.length === 0 ? <EmptyState text="لا توجد حسابات" /> : state.items.map((w) => {
        const locked = ["archived", "approval_pending"].includes(w.status);
        return (
          <div key={w._id} style={{ background: "#fff", marginBottom: 10, padding: 10, border: "1px solid #e2e8f0" }}>
            <div>الكمية المباعة: {w.totalSoldLiters ?? "--"}</div>
            <div>الإيراد الإجمالي: {w.grossSalesAmount ?? "--"}</div>
            <div>المصاريف: {w.expenseAmount ?? "--"}</div>
            <div>النقد المتوقع: {w.expectedCash ?? "--"}</div>
            <div>النقد الفعلي: {w.actualCash ?? "--"}</div>
            <div>الفرق: {w.variance ?? "--"}</div>
            <div>حالة الحساب: {w.status}</div>
            {locked ? <small style={{ color: "#b45309" }}>هذا الحساب مؤرشف/معلق بموافقة ولا يقبل التعديل المباشر.</small> : null}
            {can("submit_own_closing") && !locked ? <button onClick={() => submit(w._id)}>إرسال للمحاسب</button> : null}
          </div>
        );
      })}
    </div>
  );
}

export default WorkerClosingPage;
