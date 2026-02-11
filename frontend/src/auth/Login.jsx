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

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
        tenantSubdomain: tenantSubdomain.trim(),
      });

      const token = res.data.data.token;
      const user = res.data.data.user;

      // ✅ Remember Me logic
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      // ✅ Save user in context
      login(token, user);

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
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

        {/* Tenant Subdomain */}
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Tenant Subdomain (Optional for Super Admin)"
            value={tenantSubdomain}
            onChange={(e) => setTenantSubdomain(e.target.value)}
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

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Register Link */}
      <p style={{ marginTop: "15px" }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}