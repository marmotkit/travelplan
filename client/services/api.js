import axios from 'axios';

// 生成請求 ID
function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    console.log('API 請求:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API 請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('API 響應:', {
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error('API 響應錯誤:', error);
    return Promise.reject(error);
  }
);

export default api;

// 旅行計劃相關 API
export const planAPI = {
  getPlans: () => api.get('/plans'),
  getPlan: (id) => api.get(`/plans/${id}`),
  createPlan: (data) => api.post('/plans', data),
  updatePlan: (id, data) => api.put(`/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/plans/${id}`)
};

// 行程項目相關 API
export const tripItemAPI = {
  getTripItems: (planId) => api.get(`/trip-items?planId=${planId}`),
  createTripItem: (data) => api.post('/trip-items', data),
  updateTripItem: (id, data) => api.put(`/trip-items/${id}`, data),
  deleteTripItem: (id) => api.delete(`/trip-items/${id}`)
};

// 住宿相關 API
export const accommodationAPI = {
  getAccommodations: (planId) => api.get(`/accommodations?planId=${planId}`),
  createAccommodation: (data) => api.post('/accommodations', data),
  updateAccommodation: (id, data) => api.put(`/accommodations/${id}`, data),
  deleteAccommodation: (id) => api.delete(`/accommodations/${id}`)
};

// 預算相關 API
export const budgetAPI = {
  getBudgets: (planId) => api.get(`/budgets?planId=${planId}`),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`)
};

// 儀表板相關 API
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getStats: () => api.get('/dashboard/stats')
};

// 旅行資訊相關 API
export const travelInfoAPI = {
  getWeather: (location) => api.get(`/travel-info/weather?location=${location}`),
  getCurrency: (from, to) => api.get(`/travel-info/currency?from=${from}&to=${to}`),
  getAttractions: (location) => api.get(`/travel-info/attractions?location=${location}`)
};

// 用戶相關 API
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
};