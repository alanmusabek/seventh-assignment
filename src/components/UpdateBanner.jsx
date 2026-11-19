import { useEffect, useState } from "react";

// Registers the service worker and shows a banner when a new version of the app is ready.
export default function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Only in the built app ("npm run build"), and only in browsers that support it.
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("./sw.js").then((registration) => {
      // A new version was downloaded before and is still waiting.
      if (registration.waiting) setWaitingWorker(registration.waiting);

      // A new version is being downloaded now.
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          // "installed" + an old worker still in control = an update is ready.
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
          }
        });
      });

      // Check for a new version every minute.
      setInterval(() => registration.update(), 60 * 1000);
    });
  }, []);

  function update() {
    // When the new worker takes control, reload the page to load the new files.
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
    waitingWorker.postMessage("SKIP_WAITING");
  }

  if (!waitingWorker) return null;
  return (
    <div className="update-banner" role="alert">
      <span>A new version of Launchpad is available.</span>
      <button className="button primary" onClick={update}>Update now</button>
    </div>
  );
}
