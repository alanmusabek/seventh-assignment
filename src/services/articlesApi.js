// A real public API (dummyjson.com). The service worker caches these answers
// (network-first), so articles you opened before also work offline.
const API = "https://dummyjson.com";

async function getJson(path) {
  let response;
  try {
    response = await fetch(API + path);
  } catch {
    throw new Error("No connection and no saved copy of this page.");
  }
  if (response.status === 503) throw new Error("You are offline and this page was not saved yet.");
  if (response.status === 404) throw Object.assign(new Error("This article does not exist."), { notFound: true });
  if (!response.ok) throw new Error("The public API did not answer. Please try again.");

  // The service worker adds "X-From-Cache" when the answer comes from the cache.
  return { data: await response.json(), fromCache: response.headers.get("X-From-Cache") === "true" };
}

// GET /posts?limit=12 -> list
export function getArticles() {
  return getJson("/posts?limit=12&select=title,tags,reactions,views");
}

// GET /posts/:id -> details
export function getArticle(id) {
  return getJson(`/posts/${id}`);
}
