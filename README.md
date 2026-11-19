# Launchpad — Progressive Web App

My sixth assignment (React Router + Firebase Auth + TanStack Query task workspace) turned into an
installable **PWA** that works offline. Every feature from the previous homeworks still works.

## Run it

1. Copy `.env.example` to `.env.local` and fill in the Firebase values (see the 6th assignment).
2. Commands:

   ```sh
   npm install
   npm run dev       # development (no service worker in dev mode)
   npm test          # tests
   npm run build     # production build in dist/ (creates dist/sw.js)
   npm run preview   # serve dist/ on http://127.0.0.1:4173 — test the PWA here
   ```

The service worker only runs in the built app (`npm run build` + `npm run preview`, or the
deployed site).

**Live:** https://alanmusabek.github.io/seventh-assignment/ — GitHub Pages serves the built
`dist/` folder from the `gh-pages` branch. (`.github/workflows/deploy.yml` can also build and
deploy it, once the Firebase keys are added as repository secrets.)

## What was added for the PWA

| File | Purpose |
| --- | --- |
| `public/manifest.json` | Name, short_name, start_url, scope, `display: "standalone"`, colors, 192/512 icons |
| `public/icons/` | `icon-192.png`, `icon-512.png` |
| `index.html` | `<link rel="manifest">` + `apple-touch-icon` |
| `src/sw.js` | The service worker: install / activate / fetch, caching strategies |
| `vite.config.js` | Small plugin that writes `dist/sw.js` with the build version and built file list |
| `public/offline.html` | The offline page (works without internet, has "Retry connection") |
| `src/components/UpdateBanner.jsx` | Registers the service worker, shows "New version available → Update now" |
| `src/hooks/useOnlineStatus.js` | Online/offline state, shown in the NavBar |
| `src/components/CachedNotice.jsx` | "Offline copy: you are viewing saved data" |
| `src/services/articlesApi.js`, `src/hooks/useArticles.js` | Public API (dummyjson.com) list + details |
| `src/pages/ArticlesPage.jsx`, `ArticleDetailsPage.jsx` | `/articles` and `/articles/:id` |

## Service worker lifecycle (`src/sw.js`)

- **install** — saves the app shell into `launchpad-shell-<version>`: `./`, `index.html`, all
  built JS/CSS/images, icons, manifest and `offline.html`.
- **activate** — deletes every cache that is not the current shell, `launchpad-static` or
  `launchpad-api`, then takes control of open tabs (`clients.claim()`).
- **fetch** — picks a strategy for each request (below).
- **Updates** — every build has a new version number, so `sw.js` changes. The browser installs the
  new worker, it waits, and the app shows *"A new version of Launchpad is available — Update
  now"*. The button sends `SKIP_WAITING`, the new worker activates, deletes the old caches and the
  page reloads with the new files. Nobody has to clear browser storage.

## Caching strategies

| Requests | Strategy | Cache | Limit |
| --- | --- | --- | --- |
| Page loads (navigation) | App shell from cache → network → `offline.html` | shell | — |
| Built JS / CSS | From the shell cache → network | shell | — |
| Images, icons, Google Fonts | **Cache-first** | `launchpad-static` | 60 entries |
| Public API (`dummyjson.com`) | **Network-first** | `launchpad-api` | 30 entries |
| POST requests, Firebase Auth, tokens | **Not touched, never cached** | — | — |

When the API answer comes from the cache, the service worker adds the header `X-From-Cache: true`,
and the page shows an "Offline copy" notice. When there is no internet and nothing is saved, it
returns a 503 answer and the page shows an error with "Try again" — the app never crashes.

Tasks are stored in `localStorage`, so the whole task workspace works offline too
(`networkMode: "always"` in `queryClient.js` stops TanStack Query from pausing requests offline).

## Offline

- `public/offline.html` (open `/offline.html`, or any page that is not saved, while offline):
  message, styling, **Retry connection** button (makes a real request, not just `navigator.onLine`).
- NavBar shows **Online / Offline**.
- When the connection returns, TanStack Query refetches data automatically.

## Mobile

- Works from 320px wide, portrait and landscape.
- Hamburger menu under 800px (`NavBar.jsx` + `styles.css`).
- Filters, forms, dashboard and details become one column; buttons and inputs are at least 44px high.
- No horizontal scrolling (`minmax(min(300px, 100%), 1fr)`, `overflow-wrap`, `img { max-width: 100% }`).

## Routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home | public |
| `/about` | About | public |
| `/tasks` | Tasks list (search, filters, sort, pagination) | public |
| `/tasks/:id` | Task details | public (actions need login) |
| `/tasks/new`, `/tasks/:id/edit` | Create / edit form | **logged in** |
| `/dashboard` | Dashboard | public |
| `/articles`, `/articles/:id` | Public API list + details (offline-cached) | public |
| `/login`, `/signup` | Authentication | public |
| `/profile` | Email, UID and logout | **logged in** |
| `/offline.html` | Offline page (served by the service worker) | public |
| `*` | 404 | public |
