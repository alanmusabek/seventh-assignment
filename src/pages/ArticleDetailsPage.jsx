import { Link, useParams } from "react-router";
import { useArticle } from "../hooks/useArticles";
import CachedNotice from "../components/CachedNotice";
import Message from "../components/Message";
import Spinner from "../components/Spinner";
import NotFoundPage from "./NotFoundPage";

// Details from a public API. Cached by the service worker (network-first).
export default function ArticleDetailsPage() {
  const { id } = useParams();
  const { data, error, isPending, refetch } = useArticle(id);

  if (error?.notFound) return <NotFoundPage title="This article could not be found." />;

  return (
    <>
      <div className="row">
        <Link className="button secondary" to="/articles">← All articles</Link>
      </div>

      {isPending && <Spinner text="Loading article…" />}
      {error && <Message error title="Could not load the article." text={error.message} buttonText="Try again" onClick={refetch} />}

      {data && (
        <article className="card details">
          <CachedNotice fromCache={data.fromCache} />
          <span className="eyebrow">ARTICLE #{data.data.id}</span>
          <h1>{data.data.title}</h1>
          <p>{data.data.body}</p>
          <dl className="facts">
            <dt>Tags</dt>
            <dd>{data.data.tags.join(", ")}</dd>
            <dt>Reactions</dt>
            <dd>{data.data.reactions.likes} likes, {data.data.reactions.dislikes} dislikes</dd>
            <dt>Views</dt>
            <dd>{data.data.views}</dd>
          </dl>
        </article>
      )}
    </>
  );
}
