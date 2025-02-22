import axios from 'axios';

// 創建 axios 實例
const api = axios.create({
  // 直接使用後端 API 的完整 URL
  baseURL: 'https://travel-planner-api.onrender.com',
  // 請求超時時間（30 秒）
  timeout: 30000,
  // 請求頭
  headers: {
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID()
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 每個請求都生成新的請求 ID
    config.headers['X-Request-ID'] = crypto.randomUUID();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果請求超時或網絡錯誤，且未超過重試次數，則重試
    if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error')) &&
        (!originalRequest._retry || originalRequest._retry < 3)) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;
      console.log(`重試請求 (${originalRequest._retry}/3):`, originalRequest.url);
      
      // 等待一段時間後重試
      await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retry));
      return api(originalRequest);
    }

    // 統一錯誤處理
    console.error('API 請求失敗:', error);
    return Promise.reject(error);
  }
);

// 儀表板相關 API
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getStats: () => api.get('/dashboard/stats')
};

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

export default api;