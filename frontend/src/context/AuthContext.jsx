import { createContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext(null);

// helper: decode JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Verify token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      logout();
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));

    // 🔔 AUTO LOGOUT TIMER
    const timeout = decoded.exp * 1000 - Date.now();
    const timer = setTimeout(logout, timeout);

    return () => clearTimeout(timer);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);

    const decoded = parseJwt(token);
    if (decoded) {
      const timeout = decoded.exp * 1000 - Date.now();
      setTimeout(logout, timeout);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}