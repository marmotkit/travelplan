import axios from 'axios';

// 移除 /api 後綴，因為我們會在各個請求中添加
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'https://travelplan.onrender.com';

if (!BASE_URL) {
  console.error('API URL not configured! Please check .env file');
}

console.log('API Base URL:', BASE_URL);

// 創建 axios 實例
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000  // 10 秒超時
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      hasToken: !!token
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // 處理 401 錯誤
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// 添加測試 API
export const testApi = {
  test: async () => {
    try {
      console.log('Base URL:', BASE_URL);
      console.log('Making test request to:', `${BASE_URL}/api/test`);
      
      const response = await api.get('/api/test');
      console.log('Test response:', response.data);
      return response;
    } catch (error) {
      console.error('Test API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: BASE_URL,
        fullUrl: `${BASE_URL}${error.config?.url}`
      });
      throw error;
    }
  }
};

export const planApi = {
  getAll: () => api.get('/api/plans'),
  getById: (id) => api.get(`/api/plans/${id}`),
  create: (data) => api.post('/api/plans', data),
  update: (id, data) => api.put(`/api/plans/${id}`, data),
  delete: (id) => api.delete(`/api/plans/${id}`),
  downloadPDF: (id) => api.get(`/api/plans/${id}/pdf`, { responseType: 'blob' }),
};

export const accommodationApi = {
  getAll: () => api.get('/api/accommodations'),
  getByActivity: (activityId) => api.get(`/api/accommodations/activity/${activityId}`),
  create: (data) => api.post('/api/accommodations', data),
  update: (id, data) => api.put(`/api/accommodations/${id}`, data),
  delete: (id) => api.delete(`/api/accommodations/${id}`),
  patch: (path, data) => api.patch(`/api/accommodations${path}`, data),
  saveItems: (activityId, items) => api.post('/api/accommodations/batch', { activityId, items })
};

export const budgetApi = {
  getAll: () => api.get('/api/budgets'),
  getByActivity: (activityId) => api.get(`/api/budgets/activity/${activityId}`),
  create: (data) => api.post('/api/budgets', data),
  update: (id, data) => api.put(`/api/budgets/${id}`, data),
  delete: (id) => api.delete(`/api/budgets/${id}`),
  updateStatus: (id, status) => api.patch(`/api/budgets/${id}/status`, { status }),
  saveItems: (activityId, items, summary) => api.post('/api/budgets/batch', { activityId, items, summary })
};

export const dashboardApi = {
  getSummary: () => api.get('/api/dashboard/summary')
};

export const tripItemApi = {
  getAll: () => api.get('/api/trip-items'),
  getByActivity: (activityId) => api.get(`/api/trip-items/activity/${activityId}`),
  create: (data) => api.post('/api/trip-items', data),
  update: (id, data) => api.put(`/api/trip-items/${id}`, data),
  delete: (id) => api.delete(`/api/trip-items/${id}`)
};

export const travelInfoApi = {
  getAll: () => api.get('/api/travel-info'),
  getByActivity: (activityId) => api.get(`/api/travel-info/activity/${activityId}`),
  create: (data) => api.post('/api/travel-info', data),
  update: (id, data) => api.put(`/api/travel-info/${id}`, data),
  delete: (id) => api.delete(`/api/travel-info/${id}`)
}; 