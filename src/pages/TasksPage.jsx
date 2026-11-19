import { Link, useSearchParams } from "react-router";
import { AREAS, PRIORITIES, STATUSES } from "../services/settings";
import { useResetTasks, useTaskList } from "../hooks/useTasks";
import TaskCard from "../components/TaskCard";
import Message from "../components/Message";
import Spinner from "../components/Spinner";

export default function TasksPage() {
  // All filters live in the URL, e.g. /tasks?status=Planned&page=2
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = {
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "All",
    area: searchParams.get("area") || "All",
    priority: searchParams.get("priority") || "All",
    sort: searchParams.get("sort") || "due",
    page: Number(searchParams.get("page")) || 1,
  };

  // Cached by filters: going back to a page you already saw shows it instantly.
  const { data, error, isPending: loading, isFetching, refetch: reload } = useTaskList(filters);
  const reset = useResetTasks();

  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value === "All") next.delete(name);
    else next.set(name, value);
    if (name !== "page") next.delete("page"); // new filter -> back to page 1
    // While typing a search we replace the history entry instead of adding one per letter.
    setSearchParams(next, { replace: name === "search" });
  }

  async function handleReset() {
    if (!window.confirm("Replace all tasks with the 18 sample tasks?")) return;
    try {
      await reset.mutateAsync(); // also clears the task cache
      setSearchParams({});
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE WORKSPACE</span>
          <h1>All tasks<span>.</span></h1>
        </div>
        <div className="row">
          <button className="button secondary" onClick={handleReset}>Reset sample data</button>
          <Link className="button primary" to="/tasks/new">+ New task</Link>
        </div>
      </div>

      <div className="filters">
        <input
          type="search"
          aria-label="Search tasks"
          placeholder="Search by name, description or owner…"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
        <Select label="Status" value={filters.status} options={STATUSES} onChange={(v) => updateFilter("status", v)} />
        <Select label="Area" value={filters.area} options={AREAS} onChange={(v) => updateFilter("area", v)} />
        <Select label="Priority" value={filters.priority} options={PRIORITIES} onChange={(v) => updateFilter("priority", v)} />
        <select aria-label="Sort" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="due">Sort: due date</option>
          <option value="priority">Sort: priority</option>
          <option value="name">Sort: name A–Z</option>
          <option value="name-desc">Sort: name Z–A</option>
        </select>
      </div>

      {loading && <Spinner text="Loading tasks…" />}

      {!loading && error && (
        <Message error title="Could not load tasks." text={error.message} buttonText="Try again" onClick={reload} />
      )}

      {!loading && !error && data.items.length === 0 && (
        <Message
          title="No tasks found."
          text="Try another search or clear the filters."
          buttonText="Clear filters"
          onClick={() => setSearchParams({})}
        />
      )}

      {!loading && !error && data.items.length > 0 && (
        <>
          <p className="muted">
            {data.total} tasks found{isFetching && " · updating…"}
          </p>
          <div className="grid">
            {data.items.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          <div className="pagination">
            <button
              className="button secondary"
              disabled={data.page === 1}
              onClick={() => updateFilter("page", String(data.page - 1))}
            >
              ← Previous
            </button>
            <span>Page {data.page} of {data.totalPages}</span>
            <button
              className="button secondary"
              disabled={data.page === data.totalPages}
              onClick={() => updateFilter("page", String(data.page + 1))}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="All">Any {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
