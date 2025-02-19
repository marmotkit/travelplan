import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('認證初始化錯誤:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login(username, password);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('登出錯誤:', err);
      setError(err.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: authAPI.isAuthenticated()
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
