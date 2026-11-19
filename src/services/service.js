// A fake API. Data lives in localStorage, and every function returns a
// Promise that resolves after a short random delay, like a real server.
import { initialDataSample } from "./initial-data-sample";
import { DATA_KEY, PAGE_SIZE } from "./settings";

let simulation = { minDelay: 300, maxDelay: 1200, errorChance: 0.05 };

// Lets tests turn off the delay and the random errors.
export function setSimulation(changes) {
  simulation = { ...simulation, ...changes };
}

function request(getResult) {
  const { minDelay, maxDelay, errorChance } = simulation;
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorChance) {
        reject(new Error("The server could not finish the request. Please try again."));
        return;
      }
      try {
        resolve(getResult());
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

function load() {
  const saved = localStorage.getItem(DATA_KEY);
  if (saved) return JSON.parse(saved);
  return { nextId: initialDataSample.length + 1, items: initialDataSample };
}

function save(db) {
  localStorage.setItem(DATA_KEY, JSON.stringify(db));
}

function findTask(db, id) {
  const task = db.items.find((item) => item.id === Number(id));
  if (!task) {
    const error = new Error("This task does not exist or was removed.");
    error.notFound = true;
    throw error;
  }
  return task;
}

const priorityOrder = { High: 0, Medium: 1, Low: 2 };

// GET /tasks?search=&status=&area=&priority=&sort=&page=
export function getTasks({ search = "", status = "All", area = "All", priority = "All", sort = "due", page = 1 } = {}) {
  return request(() => {
    const text = search.toLowerCase().trim();
    const items = load().items.filter(
      (task) =>
        (status === "All" || task.status === status) &&
        (area === "All" || task.area === area) &&
        (priority === "All" || task.priority === priority) &&
        (task.name + " " + task.description + " " + task.owner).toLowerCase().includes(text),
    );

    items.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
      return a.dueDate.localeCompare(b.dueDate);
    });

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    return {
      items: items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
      total: items.length,
      page: currentPage,
      totalPages,
    };
  });
}

// GET /tasks (everything, used by the dashboard)
export function getAllTasks() {
  return request(() => load().items);
}

// GET /tasks/:id
export function getTask(id) {
  return request(() => findTask(load(), id));
}

// POST /tasks
export function createTask(values) {
  return request(() => {
    const db = load();
    const now = new Date().toISOString();
    const task = { ...values, id: db.nextId, createdAt: now, updatedAt: now };
    save({ nextId: db.nextId + 1, items: [...db.items, task] });
    return task;
  });
}

// PATCH /tasks/:id
export function updateTask(id, changes) {
  return request(() => {
    const db = load();
    const task = { ...findTask(db, id), ...changes, updatedAt: new Date().toISOString() };
    save({ ...db, items: db.items.map((item) => (item.id === task.id ? task : item)) });
    return task;
  });
}

// DELETE /tasks/:id
export function deleteTask(id) {
  return request(() => {
    const db = load();
    findTask(db, id);
    save({ ...db, items: db.items.filter((item) => item.id !== Number(id)) });
  });
}

// Puts the 18 sample tasks back.
export function resetTasks() {
  return request(() => localStorage.removeItem(DATA_KEY));
}
