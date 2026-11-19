import { Link } from "react-router";
import { useArticles } from "../hooks/useArticles";
import CachedNotice from "../components/CachedNotice";
import Message from "../components/Message";
import Spinner from "../components/Spinner";

// List from a public API. Cached by the service worker (network-first).
export default function ArticlesPage() {
  const { data, error, isPending, refetch } = useArticles();

  return (
    <>
      <span className="eyebrow">FROM A PUBLIC API</span>
      <h1>Reading list<span>.</span></h1>
      <p className="muted">Short reads from dummyjson.com. Articles you open are saved for offline use.</p>

      {isPending && <Spinner text="Loading articles…" />}
      {error && <Message error title="Could not load articles." text={error.message} buttonText="Try again" onClick={refetch} />}

      {data && (
        <>
          <CachedNotice fromCache={data.fromCache} />
          <div className="grid">
            {data.data.posts.map((post) => (
              <Link key={post.id} className="card task-card" to={`/articles/${post.id}`}>
                <span className="muted">{post.tags.join(" · ")}</span>
                <h3>{post.title}</h3>
                <p className="muted">
                  {post.reactions.likes} likes · {post.views} views
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
