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

  if (state.loading) return <LoadingState text="جارٍ تحميل بيانات الخزانات..." />;
  if (state.error) return <ErrorState error={state.error} />;
  if (state.rows.length === 0) return <EmptyState text="لا توجد خزانات بعد. أضف خزانًا لبدء استقبال الصهاريج." />;

  return (
    <div>
      <h3>الخزانات</h3>
      <p style={{ color: "#64748b", marginTop: 0 }}>هذه الصفحة تساعدك على متابعة السعة والكمية الحالية وحد التنبيه لكل خزان.</p>
      <table><thead><tr><th>الخزان</th><th>المادة</th><th>السعة (لتر)</th><th>الكمية الحالية (لتر)</th><th>حد التنبيه</th><th>الحالة</th></tr></thead><tbody>
        {state.rows.map((t) => (
          <tr key={t._id}><td>{t.tankName}</td><td>{t.fuelType}</td><td>{t.capacityLiters}</td><td>{t.currentQuantityLiters}</td><td>{t.lowLevelThreshold}</td><td>{t.status}</td></tr>
        ))}
      </tbody></table>
    </div>
  );
}

export default StorageTanksPage;
