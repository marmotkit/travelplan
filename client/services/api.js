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
  baseURL: import.meta.env.VITE_API_URL,
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
      fullURL: `${config.baseURL}${config.url}`,
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
  getPlans: () => api.get('/api/plans'),
  getPlan: (id) => api.get(`/api/plans/${id}`),
  createPlan: (data) => api.post('/api/plans', data),
  updatePlan: (id, data) => api.put(`/api/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/api/plans/${id}`)
};

// 行程項目相關 API
export const tripItemAPI = {
  getTripItems: (planId) => api.get(`/api/trip-items?planId=${planId}`),
  createTripItem: (data) => api.post('/api/trip-items', data),
  updateTripItem: (id, data) => api.put(`/api/trip-items/${id}`, data),
  deleteTripItem: (id) => api.delete(`/api/trip-items/${id}`)
};

// 住宿相關 API
export const accommodationAPI = {
  getAccommodations: (planId) => api.get(`/api/accommodations?planId=${planId}`),
  createAccommodation: (data) => api.post('/api/accommodations', data),
  updateAccommodation: (id, data) => api.put(`/api/accommodations/${id}`, data),
  deleteAccommodation: (id) => api.delete(`/api/accommodations/${id}`)
};

// 預算相關 API
export const budgetAPI = {
  getBudgets: (planId) => api.get(`/api/budgets?planId=${planId}`),
  createBudget: (data) => api.post('/api/budgets', data),
  updateBudget: (id, data) => api.put(`/api/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/api/budgets/${id}`)
};

// 儀表板相關 API
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getStats: () => api.get('/api/dashboard/stats')
};

// 旅行資訊相關 API
export const travelInfoAPI = {
  getWeather: (location) => api.get(`/api/travel-info/weather?location=${location}`),
  getCurrency: (from, to) => api.get(`/api/travel-info/currency?from=${from}&to=${to}`),
  getAttractions: (location) => api.get(`/api/travel-info/attractions?location=${location}`)
};

// 用戶相關 API
export const userAPI = {
  getUsers: () => api.get('/api/users'),
  getUser: (id) => api.get(`/api/users/${id}`),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`)
};