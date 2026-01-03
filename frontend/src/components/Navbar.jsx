import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Multi Tenant SaaS</div>

      {/* ===== MENU ===== */}
      <div style={styles.menu}>
        <Link to="/dashboard">Dashboard</Link>

        {role === "tenant_admin" && (
          <>
            <Link to="/projects">Projects</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/users">Users</Link>
          </>
        )}

        {role === "super_admin" && (
          <Link to="/tenants">Tenants</Link>
        )}
      </div>

      {/* ===== USER DROPDOWN ===== */}
      <div style={styles.userWrapper}>
        <span onClick={() => setDropdownOpen(!dropdownOpen)}>
          {user.email} ({user.role}) ▾
        </span>

        {dropdownOpen && (
          <div style={styles.dropdown}>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 25px",
    background: "#111",
    color: "#fff",
  },
  logo: { fontWeight: "bold" },
  menu: { display: "flex", gap: 20 },
  userWrapper: { position: "relative", cursor: "pointer" },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 30,
    background: "#222",
    padding: 10,
  },
};
