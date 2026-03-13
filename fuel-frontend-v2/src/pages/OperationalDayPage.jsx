import { useEffect, useState } from "react";
import { operationalDayApi, pumpAssignmentsApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function OperationalDayPage({ stationId }) {
  const [state, setState] = useState({ loading: true, error: "", success: "", day: null, assignments: [] });

  const load = () => {
    if (!stationId) return;
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    Promise.all([
      operationalDayApi.getCurrent(stationId),
      pumpAssignmentsApi.list({ stationId })
    ])
      .then(([day, assignments]) => setState({ loading: false, error: "", success: "", day, assignments: assignments?.items || assignments || [] }))
      .catch((e) => setState({ loading: false, error: e.message || "تعذر تحميل اليوم التشغيلي", success: "", day: null, assignments: [] }));
  };

  useEffect(load, [stationId]);

  const closeDay = async () => {
    try {
      await operationalDayApi.close(state.day._id);
      setState((s) => ({ ...s, success: "تم إغلاق اليوم بنجاح" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || "فشل إغلاق اليوم" }));
    }
  };

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState error={state.error} />;
  if (!state.day) return <EmptyState text="لا يوجد يوم تشغيلي نشط" />;

  return (
    <div>
      <h3>اليوم التشغيلي</h3>
      <SuccessState message={state.success} />
      <div>الحالة: {state.day.status}</div>
      <div>الفتح: {state.day.openedAt || "--"}</div>
      <div>الإغلاق: {state.day.closedAt || "--"}</div>
      <h4>الاستلامات الحالية</h4>
      {state.assignments.length === 0 ? <EmptyState text="لا توجد استلامات" /> : state.assignments.map((a) => <div key={a._id}>{a.pumpId?.pumpName || a.pumpId} - {a.status}</div>)}
      {can("archive_or_suspend_reconciliation") && state.day.status !== "closed" ? <button onClick={closeDay}>إغلاق اليوم</button> : null}
    </div>
  );
}

export default OperationalDayPage;
