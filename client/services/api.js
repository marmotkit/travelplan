import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const planApi = {
  get: async (id) => {
    const response = await axios.get(`${API_URL}/plans/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axios.post(`${API_URL}/plans`, data);
    return response.data;
  },
  
  update: async (id, data) => {
    console.log('Sending update request:', { id, data });
    const response = await axios.put(`${API_URL}/plans/${id}`, data);
    console.log('Update response:', response.data);
    return response.data;
  },
  
  getAll: async () => {
    const response = await axios.get(`${API_URL}/plans`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/plans/${id}`);
    return response.data;
  }
};

export const tripItemApi = {
  saveItems: async (activityId, items) => {
    const response = await axios.post(`${API_URL}/trip-items`, {
      activityId,
      items
    });
    return response.data;
  },
  
  getByActivity: async (activityId) => {
    try {
      const response = await axios.get(`${API_URL}/trip-items/activity/${activityId}`);
      console.log('Trip items response:', response.data);
      // 確保返回的是陣列格式
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching trip items:', error);
      return [];
    }
  }
};

export const accommodationApi = {
  saveItems: async (activityId, items) => {
    const response = await axios.post(`${API_URL}/accommodations`, {
      activityId,
      items
    });
    return response.data;
  },
  
  getByActivity: async (activityId) => {
    try {
      const response = await axios.get(`${API_URL}/accommodations/activity/${activityId}`);
      console.log('Accommodations response:', response.data);
      // 確保返回的是陣列格式
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      return [];
    }
  },
  
  updateStatus: async (id, status) => {
    const response = await axios.patch(`${API_URL}/accommodations/${id}/status`, { status });
    return response.data;
  },

  deleteItem: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/accommodations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      throw error;
    }
  }
};

export const budgetApi = {
  saveItems: async (activityId, items, summary) => {
    console.log('Sending request:', { activityId, items, summary });
    const response = await axios.post(`${API_URL}/budgets`, {
      activityId,
      items,
      summary
    });
    return response.data;
  },
  
  getByActivity: async (activityId) => {
    const response = await axios.get(`${API_URL}/budgets/activity/${activityId}`);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await axios.patch(`${API_URL}/budgets/${id}/status`, { status });
    return response.data;
  }
}; 