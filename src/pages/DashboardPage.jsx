import { useState } from "react";
import { Link } from "react-router";
import { AREAS, PRIORITIES, STATUSES } from "../services/settings";
import { useAllTasks } from "../hooks/useTasks";
import Message from "../components/Message";
import Spinner from "../components/Spinner";

export default function DashboardPage() {
  const { data, error, isPending: loading, refetch: reload } = useAllTasks();
  const [area, setArea] = useState("All");

  if (loading) return <Spinner text="Loading dashboard…" />;
  if (error) return <Message error title="Could not load the dashboard." text={error.message} buttonText="Try again" onClick={reload} />;

  // Everything below is calculated from the API data and the selected area.
  const tasks = area === "All" ? data : data.filter((task) => task.area === area);
  const today = new Date().toISOString().slice(0, 10);
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const open = tasks.filter((task) => task.status !== "Completed");
  const overdue = open.filter((task) => task.dueDate < today).length;
  const hours = tasks.reduce((sum, task) => sum + task.estimate, 0);
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const upcoming = [...open].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  const count = (field, value) => tasks.filter((task) => task[field] === value).length;
  // Link to the task list with the same filters, e.g. /tasks?status=Planned&area=Design
  const listLink = (field, value) => {
    const params = new URLSearchParams({ [field]: value });
    if (area !== "All") params.set("area", area);
    return "/tasks?" + params;
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">AT A GLANCE</span>
          <h1>Dashboard<span>.</span></h1>
        </div>
        <select aria-label="Filter by area" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="All">All areas</option>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="stats">
        <Stat label="Total tasks" value={tasks.length} />
        <Stat label="Completed" value={`${percent}%`} />
        <Stat label="Open tasks" value={open.length} />
        <Stat label="Overdue" value={overdue} />
        <Stat label="Planned hours" value={hours} />
      </div>

      <div className="grid two">
        <Breakdown
          title="By status"
          rows={STATUSES.map((s) => [s, count("status", s), listLink("status", s)])}
          total={tasks.length}
        />
        <Breakdown
          title="By priority"
          rows={PRIORITIES.map((p) => [p, count("priority", p), listLink("priority", p)])}
          total={tasks.length}
        />
      </div>

      <section className="card">
        <h2>Next up</h2>
        {upcoming.length === 0 && <p className="muted">Nothing left to do here.</p>}
        <ul className="link-list">
          {upcoming.map((task) => (
            <li key={task.id}>
              <Link to={`/tasks/${task.id}`}>{task.name}</Link>
              <span className="muted">Due {task.dueDate}</span>
            </li>
          ))}
        </ul>
        <Link className="button secondary" to="/tasks">See all tasks</Link>
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Breakdown({ title, rows, total }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {rows.map(([label, value, link]) => (
        <Link key={label} className="bar-row" to={link}>
          <span>{label}</span>
          <span className="bar">
            <span style={{ width: total ? (value / total) * 100 + "%" : 0 }} />
          </span>
          <strong>{value}</strong>
        </Link>
      ))}
    </section>
  );
}
