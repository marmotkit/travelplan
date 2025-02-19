import api from '../services/api';

const budgetAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/budgets');
      return response.data;
    } catch (error) {
      console.error('獲取預算列表失敗:', error);
      throw error;
    }
  },

  getByPlan: async (planId) => {
    try {
      const response = await api.get(`/api/plans/${planId}/budgets`);
      return response.data;
    } catch (error) {
      console.error('獲取行程預算失敗:', error);
      throw error;
    }
  },

  create: async (budgetData) => {
    try {
      const response = await api.post('/api/budgets', budgetData);
      return response.data;
    } catch (error) {
      console.error('創建預算失敗:', error);
      throw error;
    }
  },

  update: async (id, budgetData) => {
    try {
      const response = await api.put(`/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error('更新預算失敗:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error('刪除預算失敗:', error);
      throw error;
    }
  }
};

export default budgetAPI;
