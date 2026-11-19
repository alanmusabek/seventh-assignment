import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import App from "../src/App";

function openPage(path) {
  window.location.hash = path;
  render(<App />);
}

// A fake fetch answer, like the one the service worker returns from its cache.
function fakeResponse(body, headers = {}) {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers }));
}

const post = { id: 1, title: "His mother had always taught him", body: "Text", tags: ["history"], views: 10, reactions: { likes: 5, dislikes: 1 } };

it("shows the articles list from the public API", async () => {
  vi.spyOn(window, "fetch").mockImplementation(() => fakeResponse({ posts: [post] }));
  openPage("/articles");
  expect(await screen.findByText("His mother had always taught him")).toBeInTheDocument();
  expect(screen.queryByText(/Offline copy/)).not.toBeInTheDocument();
});

it("tells the user when the data comes from the cache", async () => {
  vi.spyOn(window, "fetch").mockImplementation(() => fakeResponse(post, { "X-From-Cache": "true" }));
  openPage("/articles/1");
  expect(await screen.findByRole("heading", { name: "His mother had always taught him" })).toBeInTheDocument();
  expect(screen.getByText(/Offline copy/)).toBeInTheDocument();
});

it("shows an error instead of crashing when the request fails", async () => {
  vi.spyOn(window, "fetch").mockImplementation(() => Promise.reject(new TypeError("Failed to fetch")));
  openPage("/articles");
  expect(await screen.findByText("Could not load articles.", {}, { timeout: 3000 })).toBeInTheDocument();
});

it("shows the online indicator", async () => {
  openPage("/");
  expect(await screen.findByText("Online")).toBeInTheDocument();
});
