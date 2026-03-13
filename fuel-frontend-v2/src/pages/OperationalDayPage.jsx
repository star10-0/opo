import { useEffect, useState } from "react";
import { operationalDayApi, pumpAssignmentsApi, pumpsApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function OperationalDayPage({ stationId }) {
  const [state, setState] = useState({ loading: true, error: "", success: "", day: null, assignments: [], pumpsCount: 0 });

  const load = () => {
    if (!stationId) return;
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    Promise.all([
      operationalDayApi.getCurrent(stationId),
      pumpAssignmentsApi.list({ stationId }),
      pumpsApi.list({ stationId }),
    ])
      .then(([day, assignments, pumps]) => setState({
        loading: false,
        error: "",
        success: "",
        day,
        assignments: assignments?.items || assignments || [],
        pumpsCount: (pumps?.items || pumps || []).length,
      }))
      .catch((e) => setState({ loading: false, error: e.message || "تعذر تحميل اليوم التشغيلي", success: "", day: null, assignments: [], pumpsCount: 0 }));
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

  return (
    <div>
      <h3>اليوم التشغيلي</h3>
      <p style={{ color: "#64748b", marginTop: 0 }}>بعد فتح اليوم التشغيلي، انتقل مباشرة إلى استلامات المضخات لتسجيل القراءات.</p>
      <SuccessState message={state.success} />
      {!state.day ? <EmptyState text="لا يوجد يوم تشغيلي نشط لهذه المحطة." /> : null}
      {state.pumpsCount === 0 ? <EmptyState text="لا توجد مضخات مضافة بعد، أضف مضخة للبدء." /> : null}
      {state.day ? (
        <>
          <div>الحالة: {state.day.status}</div>
          <div>الفتح: {state.day.openedAt || "--"}</div>
          <div>الإغلاق: {state.day.closedAt || "--"}</div>
          <h4>الاستلامات الحالية</h4>
          {state.assignments.length === 0 ? <EmptyState text="لا توجد استلامات لهذا اليوم بعد. الخطوة التالية: افتح استلامًا لمضخة." /> : state.assignments.map((a) => <div key={a._id}>{a.pumpId?.pumpName || a.pumpId} - {a.status}</div>)}
          {can("archive_or_suspend_reconciliation") && state.day.status !== "closed" ? <button onClick={closeDay}>إغلاق اليوم</button> : null}
        </>
      ) : null}
    </div>
  );
}

export default OperationalDayPage;
