import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

function Login() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const demoLoginEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true";

  const fillDemo = (role) => {
    if (!demoLoginEnabled) return;
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("role", role);
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      const payload = res?.data?.data;
      localStorage.setItem("token", payload?.token || "");
      localStorage.setItem("role", payload?.user?.role || "");
      localStorage.setItem("userName", payload?.user?.name || "");
      localStorage.setItem("userId", payload?.user?._id || "");
      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError(t("loginNotFound"));
      } else if (status === 401) {
        setError(t("loginUnauthorized"));
      } else if (status >= 500) {
        setError(t("loginServerError"));
      } else {
        setError(err?.response?.data?.message || err.message || t("loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapper}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <h1 style={{ marginTop: 0 }}>{t("loginTitle")}</h1>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ar">{t("arabic")}</option>
            <option value="en">{t("english")}</option>
          </select>
        </div>
        <p style={{ color: "#6b7280" }}>{t("loginSubtitle")}</p>

        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder={t("email")} value={form.email} onChange={handleChange} style={input} required />
          <input type="password" name="password" placeholder={t("password")} value={form.password} onChange={handleChange} style={input} required />
          {error ? <div style={errorBox}>{error}</div> : null}
          <button type="submit" style={primaryBtn} disabled={loading}>{loading ? t("loggingIn") : t("login")}</button>
        </form>

        {demoLoginEnabled ? (
          <>
            <hr style={{ margin: "20px 0" }} />
            <p style={{ color: "#6b7280", marginBottom: 10 }}>{t("demoAccess")}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => fillDemo("admin")} style={secondaryBtn}>{t("adminDemo")}</button>
              <button onClick={() => fillDemo("accountant")} style={secondaryBtn}>{t("accountantDemo")}</button>
              <button onClick={() => fillDemo("worker")} style={secondaryBtn}>{t("workerDemo")}</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const wrapper = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 24 };
const card = { width: 420, background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" };
const input = { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "10px" };
const primaryBtn = { width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" };
const secondaryBtn = { padding: "10px 14px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: "10px", cursor: "pointer" };
const errorBox = { background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "10px", marginBottom: "12px" };

export default Login;
