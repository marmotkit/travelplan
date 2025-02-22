import axios from 'axios';

// 創建 axios 實例
const api = axios.create({
  // 使用 Cloudflare Worker URL 作為基礎 URL
  baseURL: 'https://hidden-violet-c79a.y134679.workers.dev',
  // 允許跨域請求攜帶憑證
  withCredentials: true,
  // 請求超時時間（增加到 30 秒）
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

export default api;