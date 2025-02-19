import api from '../services/api';

const planAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/plans');
      return response.data;
    } catch (error) {
      console.error('獲取行程列表失敗:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('獲取行程詳情失敗:', error);
      throw error;
    }
  },

  create: async (planData) => {
    try {
      const response = await api.post('/api/plans', planData);
      return response.data;
    } catch (error) {
      console.error('創建行程失敗:', error);
      throw error;
    }
  },

  update: async (id, planData) => {
    try {
      const response = await api.put(`/api/plans/${id}`, planData);
      return response.data;
    } catch (error) {
      console.error('更新行程失敗:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/plans/${id}`);
      return response.data;
    } catch (error) {
      console.error('刪除行程失敗:', error);
      throw error;
    }
  }
};

export default planAPI;
