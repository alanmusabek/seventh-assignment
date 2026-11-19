import { QueryClient } from "@tanstack/react-query";

// Caching rules for every query:
// - data is "fresh" for 30 seconds: no new request when you come back to a page,
// - after that it is shown from the cache and refetched in the background,
// - unused data is removed from memory after 5 minutes,
// - networkMode "always": requests also run while offline, so tasks (localStorage) keep working
//   and the service worker can answer public API requests from its cache.
//   (By default TanStack Query pauses all requests when the browser is offline.)
// When the connection comes back, queries are refetched automatically (refetchOnReconnect).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});
