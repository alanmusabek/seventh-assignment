import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

// Protected page: only reachable when logged in (see ProtectedRoute).
export default function ProfilePage() {
  const { user, logout, error } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    if (await logout()) navigate("/login");
  }

  return (
    <section className="card login">
      <span className="eyebrow">YOUR ACCOUNT</span>
      <h1>Profile</h1>
      <dl className="facts">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>UID</dt>
        <dd>{user.uid}</dd>
      </dl>
      {error && <p className="error-text" role="alert">{error}</p>}
      <button className="button danger" onClick={handleLogout}>Log out</button>
    </section>
  );
}
