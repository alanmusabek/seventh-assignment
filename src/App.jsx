import { lazy } from "react";
import { HashRouter, Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { AuthProvider } from "./context/AuthContext";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";

// These pages are downloaded only when the user opens them.
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TaskDetailsPage = lazy(() => import("./pages/TaskDetailsPage"));
const TaskFormPage = lazy(() => import("./pages/TaskFormPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const ArticleDetailsPage = lazy(() => import("./pages/ArticleDetailsPage"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="tasks">
                <Route index element={<TasksPage />} />
                <Route path=":id" element={<TaskDetailsPage />} />
              </Route>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="articles/:id" element={<ArticleDetailsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />

              {/* Only for logged-in users. Guests are redirected to /login. */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="tasks/new" element={<TaskFormPage />} />
                <Route path="tasks/:id/edit" element={<TaskFormPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
