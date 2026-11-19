// The service worker. It runs in the background, between the app and the network.
// This file is NOT bundled with the app: on "npm run build", vite.config.js copies it to
// dist/sw.js and fills in the version number and the list of built files (see below).

const VERSION = "1795071947986"; // a new number on every build
const SHELL_CACHE = `launchpad-shell-${VERSION}`; // app shell, one cache per version
const STATIC_CACHE = "launchpad-static"; // images, icons, fonts (cache-first)
const API_CACHE = "launchpad-api"; // public API answers (network-first)

const API_ORIGIN = "https://dummyjson.com"; // the public API used on the Articles pages
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

// The app shell: everything needed to start the app without internet.
const SHELL_FILES = [
  "./",
  "offline.html",
  "manifest.json",
  "favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  ...["assets/preview-CHd0bOTo.jpg","assets/index-DkFJ3FJC.css","assets/index-CesIHwTr.js","assets/AboutPage-CgodLx5Q.js","assets/TaskDetailsPage-C-9AeE5b.js","assets/TaskFormPage-DFNVw7Qs.js","assets/DashboardPage-CounKC_q.js","assets/LoginPage-C1Mi53qZ.js","assets/SignupPage-D3kF-0wf.js","assets/ProfilePage-BJKtYMNI.js","assets/ArticlesPage-CnDwhi01.js","assets/ArticleDetailsPage-E_Hw5Gjv.js","assets/NotFoundPage-CYD-45I8.js","assets/CachedNotice-BUP_K7E_.js","index.html"], // index.html + built JS/CSS/images, e.g. "assets/index-a1b2c3.js"
];

// ---------- 1. INSTALL: save the app shell ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // cache: "reload" skips the browser's HTTP cache, so we never save an old file.
      cache.addAll(SHELL_FILES.map((file) => new Request(file, { cache: "reload" }))),
    ),
  );
  // No skipWaiting() here: the new version waits until the user clicks "Update".
});

// ---------- 2. ACTIVATE: delete caches of old versions ----------
self.addEventListener("activate", (event) => {
  const keep = [SHELL_CACHE, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => !keep.includes(name)).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()), // control open tabs right away
  );
});

// The "Update" button in the app sends this message to the waiting service worker.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// ---------- 3. FETCH: decide where every request is answered from ----------
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only GET requests are cached. Logins, sign-ups and token requests (Firebase) are not
  // touched at all, so no private data or tokens ever go into the caches.
  if (request.method !== "GET") return;

  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(pageStrategy(request));
  } else if (url.origin === API_ORIGIN) {
    event.respondWith(networkFirst(request));
  } else if (isStaticFile(request, url)) {
    event.respondWith(cacheFirst(request));
  } else if (url.origin === self.location.origin) {
    // Built JS and CSS: from the app shell cache, otherwise from the network.
    event.respondWith(caches.match(request, { ignoreVary: true }).then((cached) => cached || fetch(request)));
  }
  // Anything else (Firebase, Google login) goes to the network as usual.
});

function isStaticFile(request, url) {
  const isOurs = url.origin === self.location.origin || FONT_HOSTS.includes(url.hostname);
  return isOurs && ["image", "font", "style"].includes(request.destination);
}

// Pages: the saved app shell -> the network -> the offline page.
async function pageStrategy(request) {
  const cached = await caches.match(request, { ignoreSearch: true, ignoreVary: true });
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch {
    return caches.match("offline.html");
  }
}

// CACHE-FIRST (images, icons, fonts): they rarely change, so use the saved copy if we have one.
async function cacheFirst(request) {
  // ignoreVary: some servers send "Vary: Origin", which would make the saved copy not match.
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    // "opaque" = a file from another site that we cannot read (Google Fonts CSS); still fine to save.
    if (response.ok || response.type === "opaque") {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
      await trimCache(STATIC_CACHE, 60);
    }
    return response;
  } catch {
    return new Response("", { status: 504 }); // offline and not saved: empty answer, no crash
  }
}

// NETWORK-FIRST (public API): always try for fresh data, use the saved copy when offline.
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trimCache(API_CACHE, 30);
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) {
      // Add a header so the page knows it is showing cached data.
      const headers = new Headers(cached.headers);
      headers.set("X-From-Cache", "true");
      return new Response(cached.body, { status: cached.status, headers });
    }
    // Offline and never saved: answer with an error the page can show, instead of crashing.
    return new Response(JSON.stringify({ message: "Offline and not saved yet." }), { status: 503 });
  }
}

// Keeps a cache small: deletes the oldest entries when there are more than maxEntries.
async function trimCache(name, maxEntries) {
  const cache = await caches.open(name);
  const keys = await cache.keys(); // oldest first
  while (keys.length > maxEntries) {
    await cache.delete(keys.shift());
  }
}
