import { Link } from "react-router";

export default function NotFoundPage({ title = "This page does not exist." }) {
  return (
    <section className="card not-found">
      <span className="big-number">404</span>
      <h1>{title}</h1>
      <p className="muted">The link may be wrong, or the page was moved.</p>
      <div className="row">
        <Link className="button primary" to="/">Go home</Link>
        <Link className="button secondary" to="/tasks">All tasks</Link>
      </div>
    </section>
  );
}
