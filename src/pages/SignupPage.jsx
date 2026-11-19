import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { user, signup, loginWithGoogle, error, clearError } = useAuth();
  const [values, setValues] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => clearError, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (user) return <Navigate to="/profile" replace />;

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function validate() {
    const result = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) result.email = "Enter a valid email address.";
    if (values.password.length < 6) result.password = "Password must have at least 6 characters.";
    if (values.confirm !== values.password) result.confirm = "Passwords do not match.";
    return result;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    await signup(values.email, values.password);
    setBusy(false);
  }

  return (
    <section className="card login">
      <span className="eyebrow">JOIN LAUNCHPAD</span>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input name="email" type="email" value={values.email} onChange={handleChange} />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </label>
        <label>
          Password
          <input name="password" type="password" value={values.password} onChange={handleChange} />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" value={values.confirm} onChange={handleChange} />
          {errors.confirm && <span className="error-text">{errors.confirm}</span>}
        </label>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Create account"}
        </button>
      </form>
      <button className="button secondary" onClick={loginWithGoogle} disabled={busy}>
        Continue with Google
      </button>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
