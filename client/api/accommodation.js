import api from '../services/api';

const accommodationAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/accommodations');
      return response.data;
    } catch (error) {
      console.error('獲取住宿列表失敗:', error);
      throw error;
    }
  },

  getByPlan: async (planId) => {
    try {
      const response = await api.get(`/api/plans/${planId}/accommodations`);
      return response.data;
    } catch (error) {
      console.error('獲取行程住宿失敗:', error);
      throw error;
    }
  },

  create: async (accommodationData) => {
    try {
      const response = await api.post('/api/accommodations', accommodationData);
      return response.data;
    } catch (error) {
      console.error('創建住宿失敗:', error);
      throw error;
    }
  },

  update: async (id, accommodationData) => {
    try {
      const response = await api.put(`/api/accommodations/${id}`, accommodationData);
      return response.data;
    } catch (error) {
      console.error('更新住宿失敗:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/accommodations/${id}`);
      return response.data;
    } catch (error) {
      console.error('刪除住宿失敗:', error);
      throw error;
    }
  }
};

export default accommodationAPI;
