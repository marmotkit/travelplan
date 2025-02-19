import axios from 'axios';
import crypto from 'crypto';

// 使用正確的域名
const BASE_URL = import.meta.env.VITE_API_URL || 'https://travelplan-llmo.onrender.com';

if (!BASE_URL) {
  console.error('API URL not configured! Please check .env file');
}

console.log('API Configuration:', {
  baseUrl: BASE_URL,
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

// 創建 axios 實例
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Request-ID': crypto.randomUUID()
  },
  timeout: 10000,  // 10 秒超時
  withCredentials: true  // 啟用跨域請求攜帶憑證
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API 請求:', {
      method: config.method,
      url: config.url,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'X-Request-ID': config.headers['X-Request-ID']
      },
      data: config.data
    });

    // 添加時間戳防止快取
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

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
      data: response.data,
      headers: {
        'content-type': response.headers['content-type'],
        'x-request-id': response.headers['x-request-id']
      }
    });
    return response.data;
  },
  (error) => {
    console.error('API 響應錯誤:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// 測試 API 連接
export const test = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/health');
    console.log('API health check successful:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('API health check failed:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

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

export const authApi = {
  login: (credentials) => api.post('/api/users/login', credentials),
  logout: () => api.post('/api/users/logout'),
};