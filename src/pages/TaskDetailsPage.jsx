import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useDeleteTask, useTask, useUpdateTask } from "../hooks/useTasks";
import { StatusBadge } from "../components/TaskCard";
import Message from "../components/Message";
import Spinner from "../components/Spinner";
import NotFoundPage from "./NotFoundPage";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isValidId = /^\d+$/.test(id); // "abc" is not a valid id
  const { user } = useAuth();
  const [actionError, setActionError] = useState("");

  // Cached per id. Each id has its own cache entry, so an old answer can never show for a new id.
  const { data: task, error, isPending: loading, refetch: reload } = useTask(id, isValidId);
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const saving = update.isPending || remove.isPending;

  if (!isValidId) return <NotFoundPage title="That is not a valid task ID." />;

  async function toggleStatus() {
    setActionError("");
    try {
      await update.mutateAsync({ id, changes: { status: task.status === "Completed" ? "Planned" : "Completed" } });
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.name}"?`)) return;
    try {
      await remove.mutateAsync(id);
      navigate("/tasks");
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <div className="row">
        {/* If the page was opened directly there is no previous page, so go to the list. */}
        <button
          className="button secondary"
          onClick={() => (location.key === "default" ? navigate("/tasks") : navigate(-1))}
        >
          ← Back
        </button>
        <Link className="button secondary" to="/tasks">All tasks</Link>
      </div>

      {loading && <Spinner text="Loading task…" />}

      {!loading && error && error.notFound && <NotFoundPage title="This task could not be found." />}

      {!loading && error && !error.notFound && (
        <Message error title="Could not load the task." text={error.message} buttonText="Try again" onClick={reload} />
      )}

      {!loading && task && (
        <article className="card details">
          <span className="eyebrow">TASK #{task.id}</span>
          <h1>{task.name}</h1>
          <StatusBadge status={task.status} />
          <p>{task.description}</p>

          <dl className="facts">
            <dt>Owner</dt>
            <dd>{task.owner}</dd>
            <dt>Status</dt>
            <dd>{task.status}</dd>
            <dt>Priority</dt>
            <dd>{task.priority}</dd>
            <dt>Work area</dt>
            <dd>{task.area}</dd>
            <dt>Due date</dt>
            <dd>{task.dueDate}</dd>
            <dt>Estimated effort</dt>
            <dd>{task.estimate} hours</dd>
            <dt>Deliverable</dt>
            <dd>{task.deliverable}</dd>
            <dt>Notes</dt>
            <dd>{task.notes || "No notes."}</dd>
            <dt>Created</dt>
            <dd>{new Date(task.createdAt).toLocaleString()}</dd>
            <dt>Updated</dt>
            <dd>{new Date(task.updatedAt).toLocaleString()}</dd>
          </dl>

          {actionError && <p className="error-text">{actionError}</p>}

          {/* Changing a task needs an account. */}
          {!user && (
            <p className="muted">
              <Link to="/login">Log in</Link> to complete, edit or delete this task.
            </p>
          )}
          {user && (
            <div className="row">
              <button className="button primary" disabled={saving} onClick={toggleStatus}>
                {task.status === "Completed" ? "Reopen task" : "Mark complete"}
              </button>
              <Link className="button secondary" to={`/tasks/${task.id}/edit`}>Edit</Link>
              <button className="button danger" disabled={saving} onClick={handleDelete}>Delete</button>
            </div>
          )}
        </article>
      )}
    </>
  );
}
