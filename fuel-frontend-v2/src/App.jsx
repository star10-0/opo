import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function hasValidSessionToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const demoLoginEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true";
  if (token === "demo-token") {
    return demoLoginEnabled;
  }

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(parts[1]));
    const exp = Number(payload?.exp || 0);
    if (!Number.isFinite(exp) || exp <= 0) return true;
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function PrivateRoute({ children }) {
  return hasValidSessionToken() ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
