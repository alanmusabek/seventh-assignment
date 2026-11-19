import { Link } from "react-router";

export default function AboutPage() {
  return (
    <section className="card page-text">
      <span className="eyebrow">ABOUT THE PROJECT</span>
      <h1>About Launchpad</h1>
      <p>
        Launchpad started as my fourth React assignment: a task list that talks to a fake API with
        loading states and errors. In this version it became a multi-page app built with React
        Router.
      </p>
      <h2>What you can do</h2>
      <ul>
        <li>Search, filter, sort and page through tasks. Filters are saved in the URL.</li>
        <li>Open a task on its own page, then edit it, complete it or delete it.</li>
        <li>Create new tasks with a validated form.</li>
        <li>See statistics on the dashboard.</li>
        <li>Sign up with email or Google. Creating and changing tasks needs an account.</li>
        <li>Read articles from a public API. Articles you opened stay available offline.</li>
        <li>Install Launchpad as an app and keep using it without internet (PWA).</li>
      </ul>
      <h2>How it is built</h2>
      <ul>
        <li>React 19, React Router 7, TanStack Query, Firebase Authentication and Vite.</li>
        <li>
          <code>services/service.js</code> is a fake API. It keeps data in localStorage and answers
          after a random delay, sometimes with an error.
        </li>
        <li>
          <code>hooks/useTasks.js</code> caches server data with TanStack Query and refreshes it after
          every change.
        </li>
        <li>Rarely visited pages are lazy-loaded with React.lazy and Suspense.</li>
        <li>
          A service worker (<code>src/sw.js</code>) caches the app shell, images and API answers, and
          shows an offline page when nothing is saved.
        </li>
      </ul>
      <Link className="button primary" to="/tasks">See the tasks</Link>
    </section>
  );
}
