import api from '../services/api';

const tripItemAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/trip-items');
      return response.data;
    } catch (error) {
      console.error('獲取行程項目列表失敗:', error);
      throw error;
    }
  },

  getByPlan: async (planId) => {
    try {
      const response = await api.get(`/api/plans/${planId}/trip-items`);
      return response.data;
    } catch (error) {
      console.error('獲取行程項目失敗:', error);
      throw error;
    }
  },

  create: async (tripItemData) => {
    try {
      const response = await api.post('/api/trip-items', tripItemData);
      return response.data;
    } catch (error) {
      console.error('創建行程項目失敗:', error);
      throw error;
    }
  },

  update: async (id, tripItemData) => {
    try {
      const response = await api.put(`/api/trip-items/${id}`, tripItemData);
      return response.data;
    } catch (error) {
      console.error('更新行程項目失敗:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/trip-items/${id}`);
      return response.data;
    } catch (error) {
      console.error('刪除行程項目失敗:', error);
      throw error;
    }
  }
};

export default tripItemAPI;
