import axios from 'axios';
import { api } from './api';

// 設置 axios 攔截器來處理認證
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      const response = await api.post('/users/login', {
        username,
        password
      });
      
      console.log('Login response:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authApi.getCurrentUser();
    return user?.role === 'admin';
  }
};

export const userApi = {
  getAll: async () => {
    console.log('發送獲取用戶列表請求');
    try {
      const response = await api.get('/users');
      console.log('獲取用戶列表響應:', response.data);
      return response.data;
    } catch (error) {
      console.error('獲取用戶列表錯誤:', error);
      throw error;
    }
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
}; 