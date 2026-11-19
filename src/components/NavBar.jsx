import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu

  async function handleLogout() {
    if (await logout()) navigate("/login");
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        launchpad<span>.</span>
      </Link>

      {/* Online / offline indicator */}
      <span className={online ? "status online" : "status offline"} role="status">
        {online ? "Online" : "Offline"}
      </span>

      {/* Only visible on small screens (see styles.css) */}
      <button
        className="menu-button"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Any click inside the menu closes it on mobile */}
      <nav className={menuOpen ? "open" : ""} onClick={() => setMenuOpen(false)}>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/articles">Articles</NavLink>
        <NavLink to="/about">About</NavLink>
        {/* Show nothing while Firebase is still checking the session, to avoid flicker. */}
        {!loading && user && (
          <>
            <NavLink to="/profile">Profile</NavLink>
            <button className="nav-button" onClick={handleLogout}>Logout</button>
          </>
        )}
        {!loading && !user && (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Signup</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
