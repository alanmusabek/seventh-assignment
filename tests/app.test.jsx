import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App";
import * as api from "../src/services/service";

function openPage(path) {
  window.location.hash = path;
  render(<App />);
}

it("filters and pages tasks through the service", async () => {
  const all = await api.getTasks();
  expect(all.total).toBe(18);
  expect(all.items).toHaveLength(6);
  const done = await api.getTasks({ status: "Completed", area: "Research" });
  expect(done.items.every((t) => t.status === "Completed" && t.area === "Research")).toBe(true);
});

it("creates, updates and deletes a task", async () => {
  const task = await api.createTask({ name: "Test task", status: "Planned" });
  expect((await api.updateTask(task.id, { status: "Completed" })).status).toBe("Completed");
  await api.deleteTask(task.id);
  await expect(api.getTask(task.id)).rejects.toMatchObject({ notFound: true });
});

it("reads filters from the URL", async () => {
  openPage("/tasks?status=Completed");
  expect(await screen.findByText(/tasks found/)).toBeInTheDocument();
  expect(screen.getByLabelText("Status")).toHaveValue("Completed");
  const badges = document.querySelectorAll(".badge");
  expect([...badges].every((badge) => badge.textContent === "Completed")).toBe(true);
});

it("opens a task details page from a card", async () => {
  const user = userEvent.setup();
  openPage("/tasks");
  await user.click(await screen.findByText("Map the first-time experience"));
  expect(await screen.findByRole("heading", { name: "Map the first-time experience" })).toBeInTheDocument();
  expect(await screen.findByText("Estimated effort")).toBeInTheDocument();
});

it("shows 404 for unknown pages and missing tasks", async () => {
  openPage("/nothing-here");
  expect(await screen.findByText("404")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Go home" })).toBeInTheDocument();
});

it("shows 404 for a task id that does not exist", async () => {
  openPage("/tasks/999");
  expect(await screen.findByText("This task could not be found.")).toBeInTheDocument();
});
