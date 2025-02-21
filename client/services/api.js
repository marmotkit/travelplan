import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://travel-planner-api.onrender.com'
  : 'http://localhost:5001';

// 創建一個自定義的 axios 實例
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Request-ID': Math.random().toString(36).substring(7)
  },
  transformResponse: [
    function (data) {
      // 嘗試解析響應數據為 JSON
      try {
        return JSON.parse(data);
      } catch (e) {
        // 如果解析失敗，返回原始數據
        console.error('Response parsing error:', e);
        return data;
      }
    }
  ],
  validateStatus: function (status) {
    // 只接受 2xx 狀態碼
    return status >= 200 && status < 300;
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 確保請求頭部包含正確的內容類型
    config.headers = {
      ...config.headers,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    // 檢查響應的內容類型
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response is not JSON:', {
        url: response.config.url,
        contentType,
        data: response.data
      });
      
      // 如果響應不是 JSON，嘗試解析或轉換
      if (typeof response.data === 'string') {
        try {
          response.data = JSON.parse(response.data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          response.data = { data: response.data };
        }
      }
    }
    return response;
  },
  (error) => {
    // 處理錯誤響應
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }
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