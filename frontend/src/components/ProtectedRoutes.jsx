import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// While auth state is being hydrated from the server, don't make routing decisions
const LoadingScreen = () => <div style={{ padding: "2rem" }}>Loading...</div>;

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((store) => store.auth);
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

export const AuthenticatedUser = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((store) => store.auth);
  if (isLoading) return <LoadingScreen />;
  // Redirect to role-appropriate home so instructors don't land on student page
  if (isAuthenticated) {
    return <Navigate to={user?.role === "instructor" ? "/admin/dashboard" : "/"} />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useSelector((store) => store.auth);
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  // user is guaranteed non-null here since isAuthenticated=true always comes with a user
  if (!user || user.role !== "instructor") return <Navigate to="/" />;
  return children;
};