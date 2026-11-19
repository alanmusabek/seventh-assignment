import { Link } from "react-router";

export function StatusBadge({ status }) {
  return <span className={"badge " + status.replace(" ", "-").toLowerCase()}>{status}</span>;
}

export default function TaskCard({ task }) {
  return (
    <Link className="card task-card" to={`/tasks/${task.id}`}>
      <div className="card-top">
        <span className="muted">{task.area}</span>
        <span className={"priority " + task.priority.toLowerCase()}>{task.priority}</span>
      </div>
      <h3>{task.name}</h3>
      <p className="muted">
        {task.owner} · Due {task.dueDate}
      </p>
      <StatusBadge status={task.status} />
    </Link>
  );
}
