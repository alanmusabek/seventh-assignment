import { Link } from "react-router";
import preview from "../assets/preview.jpg";

export default function HomePage() {
  return (
    <section className="hero">
      <div>
        <span className="eyebrow">A LITTLE MORE DONE.</span>
        <h1>
          Good things take a plan<span>.</span>
        </h1>
        <p>
          Launchpad is a small task workspace. Write down what needs to be done, give it an owner
          and a due date, and move it from planned to completed.
        </p>
        <div className="row">
          <Link className="button primary" to="/tasks">Browse tasks</Link>
          <Link className="button secondary" to="/dashboard">Open dashboard</Link>
          <Link className="button secondary" to="/about">About the project</Link>
        </div>
      </div>
      <img src={preview} alt="Screenshot of the Launchpad task workspace" />
    </section>
  );
}
