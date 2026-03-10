import { useMemo, useState } from "react";
import Tanks from "./Tanks";
import Payments from "./Payments";
import GPS from "./GPS";

function Dashboard() {
  const storedRole = localStorage.getItem("role") || "worker";
  const storedName = localStorage.getItem("userName") || "مستخدم النظام";
  const [tab, setTab] = useState("tanks");

  const role = useMemo(() => storedRole, [storedRole]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <aside style={sidebar}>
        <h2 style={{ marginTop: 0 }}>لوحة التحكم</h2>
        <div style={userBox}>
          <div>الاسم: {storedName}</div>
          <div>الصلاحية: {role}</div>
        </div>

        <button style={menuBtn} onClick={() => setTab("tanks")}>
          الصهاريج
        </button>

        {(role === "accountant" || role === "admin") && (
          <button style={menuBtn} onClick={() => setTab("payments")}>
            المدفوعات
          </button>
        )}

        {role === "admin" && (
          <button style={menuBtn} onClick={() => setTab("gps")}>
            مراقبة GPS
          </button>
        )}

        <button style={logoutBtn} onClick={logout}>
          تسجيل الخروج
        </button>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        {tab === "tanks" && <Tanks />}
        {tab === "payments" && <Payments />}
        {tab === "gps" && <GPS />}
      </main>
    </div>
  );
}

const sidebar = {
  width: 260,
  background: "#111827",
  color: "#fff",
  padding: 20
};

const userBox = {
  background: "#1f2937",
  padding: 14,
  borderRadius: 10,
  marginBottom: 20,
  lineHeight: 1.9
};

const menuBtn = {
  width: "100%",
  background: "#1f2937",
  color: "#fff",
  border: "none",
  padding: "12px",
  marginBottom: 10,
  borderRadius: 8,
  cursor: "pointer",
  textAlign: "right"
};

const logoutBtn = {
  width: "100%",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "12px",
  marginTop: 20,
  borderRadius: 8,
  cursor: "pointer"
};

export default Dashboard;
