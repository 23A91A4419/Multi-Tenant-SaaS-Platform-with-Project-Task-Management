import { useEffect, useState } from "react";
import api from "../api/api";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await api.get("/tenants");
        setTenants(res.data.data.tenants || []);
      } catch (err) {
        setError("Failed to load tenants");
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, []);

  if (loading) {
    return <p style={{ padding: 30 }}>Loading tenants...</p>;
  }

  if (error) {
    return <p style={{ padding: 30, color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Tenants</h2>

      {tenants.length === 0 && <p>No tenants found</p>}

      {tenants.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Subdomain</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Total Users</th>
              <th>Total Projects</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.subdomain}</td>
                <td>{t.status}</td>
                <td>{t.subscriptionPlan}</td>
                <td>{t.totalUsers}</td>
                <td>{t.totalProjects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
