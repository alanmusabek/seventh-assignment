import { useOnlineStatus } from "../hooks/useOnlineStatus";

// Tells the user that the data on screen is a saved copy, not fresh from the server.
export default function CachedNotice({ fromCache }) {
  const online = useOnlineStatus();
  if (online && !fromCache) return null;
  return (
    <p className="notice cached" role="status">
      Offline copy: you are viewing saved data. It may be out of date.
    </p>
  );
}
