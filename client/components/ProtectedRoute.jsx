import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/authApi';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const isAuthenticated = authApi.isAuthenticated();
  const isAdmin = authApi.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}; 