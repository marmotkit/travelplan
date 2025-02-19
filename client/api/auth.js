import api from '../services/api';

const authAPI = {
  login: async (username, password) => {
    console.log('嘗試登入:', { username });
    try {
      const response = await api.post('/api/users/login', {
        username,
        password
      });
      
      console.log('登入響應:', response);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('登入錯誤:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
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
  }
};

export default authAPI;
