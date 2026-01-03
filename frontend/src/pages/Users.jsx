import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Users() {
  const { user } = useContext(AuthContext);

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

  const loggedInEmail = user?.email;

  /* ================= FETCH USERS ================= */
  async function fetchUsers() {
    if (!user?.tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/tenants/${user.tenantId}/users`);

      // 🔥 NORMALIZE BACKEND DATA
      const normalizedUsers = (res.data.data.users || []).map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name ?? u.fullName ?? "",
        role: u.role,
        isActive: u.is_active ?? u.isActive ?? false,
      }));

      setUsers(normalizedUsers);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [user]);

  /* ================= MODAL ================= */
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

  function openEditModal(u) {
    setEditUser(u);
    setForm({
      email: u.email,
      fullName: u.fullName,
      password: "",
      role: u.role,
      isActive: u.isActive,
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

  /* ================= SAVE ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.fullName) {
      alert("Full Name is required");
      return;
    }

    try {
      // ✏️ EDIT USER
      if (editUser) {
        if (editUser.email === loggedInEmail) {
          alert("You cannot edit your own account");
          return;
        }

        await api.put(`/users/${editUser.id}`, {
          fullName: form.fullName,
          isActive: form.isActive, // ✅ CORRECT FIELD
        });
      }
      // ➕ ADD USER
      else {
        if (!form.email || !form.password) {
          alert("Email and password required");
          return;
        }

        await api.post(`/tenants/${user.tenantId}/users`, {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role,
        });
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  }

  /* ================= DELETE ================= */
  async function handleDelete(u) {
    if (u.email === loggedInEmail) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    await api.delete(`/users/${u.id}`);
    fetchUsers();
  }

  /* ================= FILTER ================= */
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) return <p style={{ padding: 40 }}>Loading users...</p>;

  /* ================= UI ================= */
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
                {u.fullName || "-"}
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

      {showModal && (
        <div style={modalOverlay}>
          <form style={modal} onSubmit={handleSubmit}>
            <h3>{editUser ? "Edit User" : "Add User"}</h3>

            {!editUser && (
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            )}

            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />

            {!editUser && (
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            )}

            {editUser && (
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />{" "}
                Active
              </label>
            )}

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
};

const modal = {
  background: "#1e1e1e",
  padding: 24,
  width: 380,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  color: "#fff",
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};
