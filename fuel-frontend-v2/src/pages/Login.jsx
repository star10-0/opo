import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

const accountTypeLabel = {
  individual: "محطة فردية",
  company: "مؤسسة متعددة المحطات",
};

function Login() {
  const navigate = useNavigate();
  const { login, accountType, setAccountType, isAuthenticated, remembered } = useAuth();
  const [form, setForm] = useState({
    email: remembered.email || "",
    password: "",
    rememberMe: remembered.enabled,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const type = accountType || remembered.accountType;

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (!type) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = await login({
        email: form.email,
        password: form.password,
        accountType: type,
        rememberMe: form.rememberMe,
      });

      const stations = payload?.availableStations || [];
      const selected = payload?.selectedStation;
      if (payload?.accountType === "company" && stations.length > 1 && !selected) {
        navigate("/select-station");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.message || "تعذر تسجيل الدخول، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell" dir="rtl">
      <section className="auth-card">
        <h1 className="auth-title">تسجيل الدخول</h1>
        <p className="auth-subtitle">أدخل بريدك وكلمة المرور للمتابعة.</p>

        <div className="account-type-switch" role="group" aria-label="اختيار نوع الحساب">
          <button
            type="button"
            className={`account-type-chip ${type === "individual" ? "active" : ""}`}
            onClick={() => setAccountType("individual")}
          >
            {accountTypeLabel.individual}
          </button>
          <button
            type="button"
            className={`account-type-chip ${type === "company" ? "active" : ""}`}
            onClick={() => setAccountType("company")}
          >
            {accountTypeLabel.company}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>البريد الإلكتروني</label>
          <input type="email" required value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />

          <label>كلمة المرور</label>
          <input type="password" required value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />

          <label className="remember-row">
            <input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm((s) => ({ ...s, rememberMe: e.target.checked }))} />
            <span>تذكرني</span>
          </label>

          {error ? <div className="auth-error">{error}</div> : null}

          <button type="submit" className="auth-btn" disabled={loading}>{loading ? "جارٍ تسجيل الدخول..." : "دخول"}</button>
        </form>

        <div className="auth-footer">
          <Link to="/">الرجوع لاختيار نوع الحساب</Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
