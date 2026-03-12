import { useEffect, useState } from "react";
import { meterReadingsApi, operationalDayApi, pumpAssignmentsApi } from "../api";
import { can } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";

function PumpAssignmentsPage({ stationId }) {
  const [state, setState] = useState({ loading: true, error: "", success: "", items: [], dayId: "" });

  const load = async () => {
    if (!stationId) return;
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    try {
      const day = await operationalDayApi.getCurrent(stationId);
      const list = await pumpAssignmentsApi.list({ stationId, operationalDayId: day?._id });
      setState({ loading: false, error: "", success: "", items: list?.items || list || [], dayId: day?._id });
    } catch (e) {
      setState({ loading: false, error: e.message || "فشل تحميل الاستلامات", success: "", items: [], dayId: "" });
    }
  };

  useEffect(() => { load(); }, [stationId]);

  const intermediate = async (item) => {
    try {
      await meterReadingsApi.create({ stationId, operationalDayId: state.dayId, pumpAssignmentId: item._id, readingType: "price_change_marker", value: item.closingReading || item.openingReading || 0 });
      setState((s) => ({ ...s, success: "تم تسجيل القراءة الوسيطة" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || "فشل تسجيل القراءة" }));
    }
  };

  const close = async (item) => {
    try {
      await pumpAssignmentsApi.close(item._id);
      setState((s) => ({ ...s, success: "تم إنهاء الحساب" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || "فشل إنهاء الحساب" }));
    }
  };

  if (state.loading) return <LoadingState />;
  return (
    <div>
      <h3>استلامات المضخات</h3>
      {state.error ? <ErrorState error={state.error} /> : null}
      <SuccessState message={state.success} />
      {state.items.length === 0 ? <EmptyState text="لا توجد استلامات مضخات" /> : (
        <table style={{ width: "100%" }}><thead><tr><th>المضخة</th><th>العامل</th><th>مساعدون</th><th>البداية</th><th>النهاية</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>
          {state.items.map((i) => (
            <tr key={i._id}>
              <td>{i.pumpId?.pumpName || i.pumpId}</td>
              <td>{i.primaryWorkerId?.name || i.primaryWorkerId}</td>
              <td>{Array.isArray(i.helperWorkerIds) ? i.helperWorkerIds.map((h) => h.name || h).join(", ") : "--"}</td>
              <td>
                <input value={i.openingReading ?? ""} readOnly={Boolean(i.openingReadingLocked)} style={i.openingReadingLocked ? { background: "#f1f5f9", color: "#64748b", border: "1px solid #94a3b8" } : {}} />
                {i.openingReadingLocked ? <small>مقفل</small> : null}
              </td>
              <td>{i.closingReading ?? "--"}</td>
              <td>{i.status}</td>
              <td>
                {can("record_intermediate_reading") ? <button onClick={() => intermediate(i)}>قراءة وسيطة</button> : null}
                {can("record_closing_reading") ? <button onClick={() => close(i)}>إنهاء الحساب</button> : null}
              </td>
            </tr>
          ))}
        </tbody></table>
      )}
    </div>
  );
}

export default PumpAssignmentsPage;
