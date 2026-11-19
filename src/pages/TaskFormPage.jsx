import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AREAS, PRIORITIES, STATUSES } from "../services/settings";
import { useCreateTask, useTask, useUpdateTask } from "../hooks/useTasks";
import Message from "../components/Message";
import Spinner from "../components/Spinner";
import NotFoundPage from "./NotFoundPage";

const emptyTask = {
  name: "",
  description: "",
  area: "Design",
  status: "Planned",
  priority: "Medium",
  owner: "",
  dueDate: "",
  estimate: 1,
  deliverable: "",
  notes: "",
};

// Used for both /tasks/new and /tasks/:id/edit
export default function TaskFormPage() {
  const { id } = useParams();
  // Only load a task when editing. A new task starts empty.
  const { data, error, isPending, refetch: reload } = useTask(id, Boolean(id));

  if (!id) return <TaskForm key="new" initial={emptyTask} />;
  if (isPending) return <Spinner text="Loading form…" />;
  if (error && error.notFound) return <NotFoundPage title="This task could not be found." />;
  if (error) return <Message error title="Could not load the task." text={error.message} buttonText="Try again" onClick={reload} />;

  // key makes React create a fresh form when switching between tasks
  return <TaskForm key={id} initial={data} id={id} />;
}

function TaskForm({ initial, id }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const create = useCreateTask();
  const update = useUpdateTask();
  const saving = create.isPending || update.isPending;

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function validate() {
    const result = {};
    if (values.name.trim().length < 3) result.name = "Name must have at least 3 characters.";
    if (values.description.trim().length < 10) result.description = "Description must have at least 10 characters.";
    if (values.owner.trim().length < 2) result.owner = "Owner must have at least 2 characters.";
    if (!values.dueDate) result.dueDate = "Choose a due date.";
    if (!(Number(values.estimate) > 0)) result.estimate = "Estimate must be more than 0.";
    if (values.deliverable.trim().length < 3) result.deliverable = "Describe the result.";
    return result;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaveError("");
    try {
      const task = { ...values, estimate: Number(values.estimate) };
      const saved = id ? await update.mutateAsync({ id, changes: task }) : await create.mutateAsync(task);
      navigate(`/tasks/${saved.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  return (
    <section className="card">
      <span className="eyebrow">{id ? "EDIT TASK" : "NEW TASK"}</span>
      <h1>{id ? "Edit task" : "Create a task"}</h1>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <Field label="Name" error={errors.name}>
          <input name="name" value={values.name} onChange={handleChange} />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea name="description" rows="3" value={values.description} onChange={handleChange} />
        </Field>
        <div className="form-row">
          <Field label="Work area">
            <select name="area" value={values.area} onChange={handleChange}>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" value={values.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select name="priority" value={values.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field label="Owner" error={errors.owner}>
            <input name="owner" value={values.owner} onChange={handleChange} />
          </Field>
          <Field label="Due date" error={errors.dueDate}>
            <input name="dueDate" type="date" value={values.dueDate} onChange={handleChange} />
          </Field>
          <Field label="Estimate (hours)" error={errors.estimate}>
            <input name="estimate" type="number" min="0.25" step="0.25" value={values.estimate} onChange={handleChange} />
          </Field>
        </div>
        <Field label="What done looks like" error={errors.deliverable}>
          <input name="deliverable" value={values.deliverable} onChange={handleChange} />
        </Field>
        <Field label="Notes (optional)">
          <textarea name="notes" rows="3" value={values.notes} onChange={handleChange} />
        </Field>

        {saveError && <p className="error-text">{saveError}</p>}

        <div className="row">
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save task"}
          </button>
          <Link className="button secondary" to={id ? `/tasks/${id}` : "/tasks"}>Cancel</Link>
        </div>
      </form>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      {label}
      {children}
      {error && <span className="error-text">{error}</span>}
    </label>
  );
}
