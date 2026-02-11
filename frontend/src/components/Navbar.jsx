import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";



export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo}>Multi Tenant SaaS</div>

      {/* Hamburger (mobile) */}
      <button
        style={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Navigation Menu */}
      <div
        style={{
          ...styles.menu,
          ...(menuOpen ? styles.menuOpen : {}),
        }}
      >
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>

        {(role === "tenant_admin" || role === "super_admin") && (
          <Link to="/tasks">Tasks</Link>
        )}

        {role === "tenant_admin" && <Link to="/users">Users</Link>}
        {role === "super_admin" && <Link to="/tenants">Tenants</Link>}
      </div>

      {/* User Dropdown */}
      <div style={styles.userWrapper}>
        <span
          style={styles.user}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {user.email} ({user.role}) ▾
        </span>

        {dropdownOpen && (
          <div style={styles.dropdown}>
            <Link to="/profile">Profile</Link>
            <Link to="/settings">Settings</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ================= STYLES ================= */

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    background: "#111",
    color: "#fff",
    position: "relative",
  },
  logo: {
    fontWeight: "bold",
  },
  hamburger: {
    display: "none",
    fontSize: "22px",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  menu: {
    display: "flex",
    gap: "15px",
  },
  menuOpen: {
    position: "absolute",
    top: "60px",
    left: 0,
    width: "100%",
    flexDirection: "column",
    background: "#111",
    padding: "15px",
  },
  userWrapper: {
    position: "relative",
    cursor: "pointer",
  },
  user: {
    fontSize: "14px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "30px",
    background: "#222",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "140px",
  },
};