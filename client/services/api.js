import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('API URL not configured! Please check .env file');
}

// 創建 axios 實例
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - token:', token ? '存在' : '不存在');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未認證，清除本地存儲並重定向到登入頁
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const planApi = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
  downloadPDF: (id) => api.get(`/plans/${id}/pdf`, { responseType: 'blob' }),
};

export const accommodationApi = {
  getAll: () => api.get('/accommodations'),
  getByActivity: (activityId) => api.get(`/accommodations/activity/${activityId}`),
  create: (data) => api.post('/accommodations', data),
  update: (id, data) => api.put(`/accommodations/${id}`, data),
  delete: (id) => api.delete(`/accommodations/${id}`),
  patch: (path, data) => api.patch(`/accommodations${path}`, data),
  saveItems: (activityId, items) => api.post('/accommodations/batch', { activityId, items })
};

export const budgetApi = {
  getAll: () => api.get('/budgets'),
  getByActivity: (activityId) => api.get(`/budgets/activity/${activityId}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  updateStatus: (id, status) => api.patch(`/budgets/${id}/status`, { status }),
  saveItems: (activityId, items, summary) => api.post('/budgets/batch', { activityId, items, summary })
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary')
};

export const tripItemApi = {
  getAll: () => api.get('/trip-items'),
  getByActivity: (activityId) => api.get(`/trip-items/activity/${activityId}`),
  create: (data) => api.post('/trip-items', data),
  update: (id, data) => api.put(`/trip-items/${id}`, data),
  delete: (id) => api.delete(`/trip-items/${id}`)
};

export const travelInfoApi = {
  getAll: () => api.get('/travel-info'),
  getByActivity: (activityId) => api.get(`/travel-info/activity/${activityId}`),
  create: (data) => api.post('/travel-info', data),
  update: (id, data) => api.put(`/travel-info/${id}`, data),
  delete: (id) => api.delete(`/travel-info/${id}`)
}; 