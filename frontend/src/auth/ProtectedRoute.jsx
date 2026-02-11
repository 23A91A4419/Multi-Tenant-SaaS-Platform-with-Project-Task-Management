import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <h3 style={{ padding: 30 }}>Loading...</h3>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}