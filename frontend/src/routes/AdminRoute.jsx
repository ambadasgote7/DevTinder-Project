import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useSelector(
    (store) => store.user
  );

  // ⛔ WAIT until AuthLoader finishes
  if (loading) {
    return <div>Checking admin access...</div>;
  }

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // ❌ Logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin allowed
  return <Outlet />;
};

export default AdminRoute;
