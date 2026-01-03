import { createContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext(null);

// 🔹 Decode JWT safely
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

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // 🔁 Restore user on app load
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);

    // ❌ Invalid / expired token
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      logout();
      setLoading(false);
      return;
    }

    // ✅ Fetch current user
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));

    // 🔔 Auto logout when token expires
    const timeout = decoded.exp * 1000 - Date.now();
    const timer = setTimeout(logout, timeout);

    return () => clearTimeout(timer);
  }, []);

  const login = (token, userData, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }

    setUser(userData);

    const decoded = parseJwt(token);
    if (decoded) {
      const timeout = decoded.exp * 1000 - Date.now();
      setTimeout(logout, timeout);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
