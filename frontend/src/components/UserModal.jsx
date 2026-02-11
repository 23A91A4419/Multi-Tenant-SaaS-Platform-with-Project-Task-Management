import { useEffect, useState } from "react";
import api from "../api/api";

export default function UserModal({ tenantId, user, onClose, onSuccess }) {
  const isEdit = !!user;

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "user",
    is_active: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setForm({
        email: user.email,
        full_name: user.full_name,
        password: "",
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.full_name) {
      setError("Email and Full Name required");
      return;
    }

    if (!isEdit && !form.password) {
      setError("Password required");
      return;
    }

    if (isEdit) {
      await api.put(`/users/${user.id}`, form);
    } else {
      await api.post(`/tenants/${tenantId}/users`, form);
    }

    onSuccess();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{isEdit ? "Edit User" : "Add User"}</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={submit}>
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" />
          <input name="password" value={form.password} onChange={handleChange} placeholder={isEdit ? "Password (optional)" : "Password"} />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          <label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Active
          </label>

          <div style={{ marginTop: 10 }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  width: 400,
};