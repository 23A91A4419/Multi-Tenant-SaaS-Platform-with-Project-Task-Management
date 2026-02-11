import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");

  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (isSuperAdmin) {
      api.get("/tenants").then((res) => {
        if (res.data.success) {
          setTenants(res.data.data.tenants);
          // Auto-select first tenant if available
          if (res.data.data.tenants.length > 0) {
            setSelectedTenantId(res.data.data.tenants[0].id);
          }
        }
      }).catch(err => console.error("Failed to load tenants", err));
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (isSuperAdmin && !selectedTenantId) {
      setError("Please select a tenant");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name,
        description,
      };

      if (isSuperAdmin) {
        payload.tenantId = selectedTenantId;
      }

      await api.post("/projects", payload);

      // ✅ After success → go back to projects list
      navigate("/projects");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create New Project</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>

        {isSuperAdmin && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Select Tenant:</label>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
              required
            >
              <option value="" disabled>-- Select a Tenant --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subdomain})
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "8px", minHeight: "100px" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}