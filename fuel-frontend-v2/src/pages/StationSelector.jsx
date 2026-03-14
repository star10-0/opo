import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

function StationSelector() {
  const navigate = useNavigate();
  const { isAuthenticated, accountType, availableStations, selectedStation, selectStation } = useAuth();
  const [stationId, setStationId] = useState(selectedStation?._id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsSelection = useMemo(() => accountType === "company" && availableStations.length > 1, [accountType, availableStations.length]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!needsSelection) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!stationId) {
      setError("الرجاء اختيار محطة للمتابعة");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await selectStation(stationId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "تعذر تحديد المحطة الحالية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell" dir="rtl">
      <section className="auth-card">
        <h1 className="auth-title">اختر المحطة الحالية</h1>
        <p className="auth-subtitle">هذه المؤسسة مرتبطة بأكثر من محطة. اختر المحطة التي تريد العمل عليها الآن.</p>

        <form className="auth-form" onSubmit={submit}>
          <select value={stationId} onChange={(e) => setStationId(e.target.value)} required>
            <option value="">-- اختر محطة --</option>
            {availableStations.map((station) => (
              <option key={station._id} value={station._id}>{station.name} ({station.code})</option>
            ))}
          </select>
          {error ? <div className="auth-error">{error}</div> : null}
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? "جارٍ الحفظ..." : "دخول لوحة التحكم"}</button>
        </form>
      </section>
    </main>
  );
}

export default StationSelector;
