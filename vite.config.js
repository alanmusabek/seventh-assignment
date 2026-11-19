import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Creates dist/sw.js from src/sw.js during "npm run build".
// Built files have random names (assets/index-a1b2c3.js), so we put the real list of
// files into the service worker, plus a new version number for every build.
function serviceWorker() {
  return {
    name: "service-worker",
    apply: "build",
    enforce: "post", // run last, when index.html and all assets are in the bundle
    generateBundle(options, bundle) {
      const files = Object.keys(bundle);
      const code = readFileSync("src/sw.js", "utf8")
        .replace("__VERSION__", Date.now())
        .replace("__BUILD_FILES__", JSON.stringify(files));
      this.emitFile({ type: "asset", fileName: "sw.js", source: code });
    },
  };
}

export default defineConfig({
  plugins: [react(), serviceWorker()],
  base: "./",
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.js",
    restoreMocks: true,
  },
});
