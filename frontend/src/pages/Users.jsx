import { useEffect, useState } from "react";
import api from "../api/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "user",
    isActive: true,
  });

  const [loggedInEmail, setLoggedInEmail] = useState("");

  // =========================
  // Get logged-in user & tenant
  // =========================
  async function getAuthInfo() {
    const res = await api.get("/auth/me");
    return {
      tenantId: res.data.data.tenant.id,
      email: res.data.data.email,
    };
  }

  // =========================
  // Fetch users
  // =========================
  async function fetchUsers() {
    setLoading(true);
    try {
      const { tenantId, email } = await getAuthInfo();
      setLoggedInEmail(email);

      const res = await api.get(`/tenants/${tenantId}/users`);
      setUsers(res.data.data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function openAddModal() {
    setEditUser(null);
    setForm({
      email: "",
      fullName: "",
      password: "",
      role: "user",
      isActive: true,
    });
    setShowModal(true);
  }

  function openEditModal(user) {
    setEditUser(user);
    setForm({
      email: user.email,
      fullName: user.fullName,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  // =========================
  // Add / Edit user
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.fullName) {
      alert("Email and Full Name are required");
      return;
    }

    try {
      if (editUser) {
        if (editUser.email === loggedInEmail) {
          alert("You cannot edit your own admin account");
          return;
        }

        await api.put(`/users/${editUser.id}`, {
          fullName: form.fullName,
          role: form.role,
          isActive: form.isActive,
          ...(form.password && { password: form.password }),
        });
      } else {
        if (!form.password) {
          alert("Password is required");
          return;
        }

        const { tenantId } = await getAuthInfo();
        await api.post(`/tenants/${tenantId}/users`, form);
      }

      setShowModal(false);
      fetchUsers();
    } catch {
      alert("Operation failed");
    }
  }

  // =========================
  // Delete user
  // =========================
  async function handleDelete(user) {
    if (user.email === loggedInEmail) {
      alert("You cannot delete your own admin account");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    await api.delete(`/users/${user.id}`);
    fetchUsers();
  }

  // =========================
  // Filters
  // =========================
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) return <p style={{ padding: 40 }}>Loading users...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Users</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="tenant_admin">Tenant Admin</option>
          <option value="user">User</option>
        </select>

        <button onClick={openAddModal}>+ Add User</button>
      </div>

      {filteredUsers.length === 0 && <p>No users found</p>}

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>
                {u.fullName}
                {u.email === loggedInEmail && " (You)"}
              </td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button
                  onClick={() => openEditModal(u)}
                  disabled={u.email === loggedInEmail}
                >
                  Edit
                </button>{" "}
                <button
                  onClick={() => handleDelete(u)}
                  disabled={u.email === loggedInEmail}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div style={modalOverlay}>
          <form style={modal} onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 15 }}>
              {editUser ? "Edit User" : "Add User"}
            </h3>

            <label>Email</label>
            <input
              name="email"
              value={form.email}
              disabled={!!editUser}
              onChange={handleChange}
              required
            />

            <label>Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={editUser ? "Leave blank to keep unchanged" : ""}
            />

            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active
            </label>

            <div style={modalActions}>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  background: "#1e1e1e",
  padding: 24,
  width: 380,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  color: "#f1f1f1",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 15,
};