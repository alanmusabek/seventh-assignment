import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, loginWithGoogle, error, clearError } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => clearError, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Already logged in (or just logged in): go to the page the user wanted, or the profile.
  if (user) return <Navigate to={location.state?.from || "/profile"} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    await login(email, password);
    setBusy(false);
  }

  async function handleGoogle() {
    setBusy(true);
    await loginWithGoogle();
    setBusy(false);
  }

  return (
    <section className="card login">
      <span className="eyebrow">WELCOME BACK</span>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </label>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Log in"}
        </button>
      </form>
      <button className="button secondary" onClick={handleGoogle} disabled={busy}>
        Continue with Google
      </button>
      <p className="muted">
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </section>
  );
}
