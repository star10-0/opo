import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingAccountType from "./pages/LandingAccountType";
import Login from "./pages/Login";
import StationSelector from "./pages/StationSelector";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingAccountType />} />
      <Route path="/login" element={<Login />} />
      <Route path="/select-station" element={<ProtectedRoute><StationSelector /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
