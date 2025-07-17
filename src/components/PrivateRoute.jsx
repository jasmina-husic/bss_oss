import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ roles = [], children }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;

  if (roles.length && !roles.includes(user.role))
    return <div className="p-6 text-red-600">Not authorised</div>;

  return children;
}
