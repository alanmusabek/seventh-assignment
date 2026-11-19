import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App";
import * as api from "../src/services/service";
import { queryClient } from "../src/queryClient";
import { taskKeys } from "../src/hooks/useTasks";

function openPage(path) {
  window.location.hash = path;
  render(<App />);
}

it("redirects guests from /profile to /login", async () => {
  openPage("/profile");
  expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Signup" })).toBeInTheDocument();
});

it("logs in, shows the profile and logs out", async () => {
  const user = userEvent.setup();
  openPage("/login");
  await user.type(await screen.findByPlaceholderText("you@example.com"), "me@example.com");
  await user.type(screen.getByPlaceholderText("••••••••"), "secret1");
  await user.click(screen.getByRole("button", { name: "Log in" }));

  expect(await screen.findByText("me@example.com")).toBeInTheDocument();
  expect(screen.getByText("uid-123")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Logout" }));
  expect(await screen.findByRole("link", { name: "Login" })).toBeInTheDocument();
});

it("shows an error for a wrong password", async () => {
  const user = userEvent.setup();
  openPage("/login");
  await user.type(await screen.findByPlaceholderText("you@example.com"), "me@example.com");
  await user.type(screen.getByPlaceholderText("••••••••"), "wrong");
  await user.click(screen.getByRole("button", { name: "Log in" }));
  expect(await screen.findByText("Wrong email or password.")).toBeInTheDocument();
});

it("validates the signup form", async () => {
  const user = userEvent.setup();
  openPage("/signup");
  await user.type(await screen.findByLabelText("Email"), "bad");
  await user.type(screen.getByLabelText("Password"), "123");
  await user.type(screen.getByLabelText("Confirm password"), "456");
  await user.click(screen.getByRole("button", { name: "Create account" }));
  expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  expect(screen.getByText("Password must have at least 6 characters.")).toBeInTheDocument();
  expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
});

it("caches the task list and refreshes it after a change", async () => {
  const user = userEvent.setup();
  openPage("/login");
  await user.click(await screen.findByRole("button", { name: "Continue with Google" }));
  await screen.findByText("google@example.com");

  window.location.hash = "/tasks/1";
  expect(await screen.findByRole("heading", { name: "Define the project north star" })).toBeInTheDocument();
  expect(queryClient.getQueryData(taskKeys.detail(1))).toMatchObject({ status: "Completed" });

  await user.click(screen.getByRole("button", { name: "Reopen task" }));
  // The mutation invalidates the cache, so the page shows the new status.
  expect(await screen.findByRole("button", { name: "Mark complete" })).toBeInTheDocument();
  expect((await api.getTask(1)).status).toBe("Planned");
});
