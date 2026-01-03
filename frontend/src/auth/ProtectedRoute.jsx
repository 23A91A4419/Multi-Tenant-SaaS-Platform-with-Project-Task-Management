import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // ⏳ Wait until auth check finishes
  if (loading) {
    return <h3 style={{ padding: 30 }}>Loading...</h3>;
  }

  // 🔒 Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
