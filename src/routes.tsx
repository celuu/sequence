import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "./auth/AuthLayout";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ExercisesPage from "./pages/ExercisesPage";
import SpringSettingsPage from "./pages/SpringSettingsPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import WorkoutBuilderPage from "./pages/WorkoutBuilderPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/exercises", element: <ExercisesPage /> },
          { path: "/settings/springs", element: <SpringSettingsPage /> },
          { path: "/workouts", element: <WorkoutsPage /> },
          { path: "/workouts/:id", element: <WorkoutBuilderPage /> },
        ],
      },
    ],
  },
]);
