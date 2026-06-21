import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
