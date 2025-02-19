import axios from 'axios';

// 生成請求 ID
function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const BASE_URL = import.meta.env.VITE_API_URL || 'https://travelplan-llmo.onrender.com';
console.log('API Base URL:', BASE_URL);

// 創建 axios 實例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 添加請求 ID
    config.headers['X-Request-ID'] = generateRequestId();

    // 從 localStorage 獲取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API 請求:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'X-Request-ID': config.headers['X-Request-ID']
      },
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
      data: response.data,
      headers: response.headers
    });
    return response.data;
  },
  (error) => {
    console.error('API 響應錯誤:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
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

// 用戶相關 API
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/users/login', credentials);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('登入錯誤:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
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

export default api;