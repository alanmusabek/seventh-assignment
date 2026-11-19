import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { setSimulation } from "../src/services/service";
import { queryClient } from "../src/queryClient";

// Tests do not talk to the real Firebase. This fake keeps the user in memory.
vi.mock("../src/services/auth", () => {
  let user = null;
  let listener = () => {};
  const setUser = (next) => {
    user = next;
    listener(user);
  };
  return {
    watchUser: (callback) => {
      listener = callback;
      callback(user);
      return () => {};
    },
    signUp: async (email) => setUser({ email, uid: "uid-123" }),
    logIn: async (email, password) => {
      if (password !== "secret1") throw { code: "auth/invalid-credential" };
      setUser({ email, uid: "uid-123" });
    },
    logInWithGoogle: async () => setUser({ email: "google@example.com", uid: "uid-google" }),
    logOut: async () => setUser(null),
    authErrorMessage: (error) => (error.code === "auth/invalid-credential" ? "Wrong email or password." : "Error"),
  };
});

beforeEach(async () => {
  localStorage.clear();
  window.location.hash = "";
  queryClient.clear(); // every test starts with an empty cache
  // No delay and no random errors in tests.
  setSimulation({ minDelay: 0, maxDelay: 0, errorChance: 0 });
  const auth = await import("../src/services/auth");
  await auth.logOut(); // every test starts logged out
});

afterEach(() => cleanup());
