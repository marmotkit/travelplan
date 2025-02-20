import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { authApi } from '../services/authApi';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const isAuthenticated = authApi.isAuthenticated();
  const isAdmin = authApi.isAdmin();

  useEffect(() => {
    // 檢查 token 是否有效
    if (!isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // 保存嘗試訪問的 URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};