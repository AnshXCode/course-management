import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/courses" : "/login"} replace />;
}
