import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSubdomain, setTenantSubdomain] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isSuperAdmin = email === "superadmin@system.com";

      // ✅ Decide tenant safely
      const effectiveTenant = isSuperAdmin
        ? "demo"
        : tenantSubdomain.trim();

      if (!email || !password || !effectiveTenant) {
        setError("Email, password, and tenant subdomain are required");
        setLoading(false);
        return;
      }

      // ✅ Store tenant for future requests
      localStorage.setItem("tenantSubdomain", effectiveTenant);

      // ✅ Backend-required payload
      const res = await api.post("/auth/login", {
        email,
        password,
        tenantSubdomain: effectiveTenant,
      });

      const { token, user } = res.data.data;

      // ✅ Remember Me handling
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Tenant */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Tenant Subdomain (demo)"
            value={tenantSubdomain}
            onChange={(e) => setTenantSubdomain(e.target.value)}
            required
          />
        </div>

        {/* Remember Me */}
        <div style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{" "}
            Remember me
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
