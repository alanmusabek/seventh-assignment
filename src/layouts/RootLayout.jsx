import { Suspense } from "react";
import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import Spinner from "../components/Spinner";
import UpdateBanner from "../components/UpdateBanner";

// Shared frame for every page. <Outlet /> is where the current page appears.
export default function RootLayout() {
  return (
    <>
      <NavBar />
      <UpdateBanner />
      <main className="container">
        {/* Shows a spinner while a lazy-loaded page is downloading. */}
        <Suspense fallback={<Spinner text="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="footer">Launchpad · A little more done.</footer>
    </>
  );
}
