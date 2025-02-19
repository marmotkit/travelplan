import api from '../services/api';

const userAPI = {
  getUsers: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('創建用戶失敗:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('更新用戶失敗:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('刪除用戶失敗:', error);
      throw error;
    }
  }
};

export default userAPI;
