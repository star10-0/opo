import { useEffect, useState } from "react";
import { storageTanksApi } from "../api";
import { EmptyState, ErrorState, LoadingState } from "../components/Feedback";

function StorageTanksPage({ stationId }) {
  const [state, setState] = useState({ loading: true, error: "", rows: [] });

  useEffect(() => {
    if (!stationId) return;
    setState({ loading: true, error: "", rows: [] });
    storageTanksApi
      .list(stationId)
      .then((rows) => setState({ loading: false, error: "", rows: rows?.items || rows || [] }))
      .catch((e) => setState({ loading: false, error: e.message || "فشل تحميل الخزانات", rows: [] }));
  }, [stationId]);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState error={state.error} />;
  if (state.rows.length === 0) return <EmptyState text="لا توجد خزانات" />;

  return (
    <div>
      <h3>الخزانات</h3>
      <table style={{ width: "100%" }}><thead><tr><th>الخزان</th><th>المادة</th><th>السعة</th><th>الكمية الحالية</th><th>حد التنبيه</th><th>الحالة</th></tr></thead><tbody>
        {state.rows.map((t) => (
          <tr key={t._id}><td>{t.tankName}</td><td>{t.fuelType}</td><td>{t.capacityLiters}</td><td>{t.currentQuantityLiters}</td><td>{t.lowLevelThreshold}</td><td>{t.status}</td></tr>
        ))}
      </tbody></table>
    </div>
  );
}

export default StorageTanksPage;
