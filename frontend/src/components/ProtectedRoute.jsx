import { Navigate, Outlet } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "./PageLoader";

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !authUser.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
