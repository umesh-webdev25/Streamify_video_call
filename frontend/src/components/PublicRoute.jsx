import { Navigate, Outlet } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "./PageLoader";

const PublicRoute = ({ children }) => {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  if (authUser) {
    if (!authUser.isOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
