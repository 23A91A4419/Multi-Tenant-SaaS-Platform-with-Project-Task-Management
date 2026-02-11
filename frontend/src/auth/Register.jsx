import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    if (
      !form.organizationName ||
      !form.subdomain ||
      !form.adminEmail ||
      !form.adminFullName ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "All fields are required";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    if (!form.acceptTerms) {
      return "You must accept Terms & Conditions";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register-tenant", {
        tenantName: form.organizationName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminFullName: form.adminFullName,
        adminPassword: form.password,
      });

      setSuccess("Tenant registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register Tenant</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="organizationName"
            placeholder="Organization Name"
            value={form.organizationName}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="subdomain"
            placeholder="Subdomain"
            value={form.subdomain}
            onChange={handleChange}
            style={styles.input}
          />
          {form.subdomain && (
            <small style={styles.preview}>
              {form.subdomain}.yourapp.com
            </small>
          )}

          <input
            type="email"
            name="adminEmail"
            placeholder="Admin Email"
            value={form.adminEmail}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="adminFullName"
            placeholder="Admin Full Name"
            value={form.adminFullName}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
            />
            I accept Terms & Conditions
          </label>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    backgroundColor: "#2a2a2a",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #555",
    backgroundColor: "#1e1e1e",
    color: "#fff",
  },
  preview: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "-8px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "#ff4d4d",
    marginBottom: "10px",
    textAlign: "center",
  },
  success: {
    color: "#4ade80",
    marginBottom: "10px",
    textAlign: "center",
  },
  footer: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  },
};