import axios from 'axios';

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
    'Accept': 'application/json'
  },
  timeout: 10000,  // 10 秒超時
  withCredentials: false  // 不需要憑證
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const requestId = Math.random().toString(36).substring(7);
    
    console.log('API Request:', {
      id: requestId,
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      hasToken: !!config.headers.Authorization,
      timestamp: new Date().toISOString()
    });

    // 添加請求 ID 到 headers
    config.headers['X-Request-ID'] = requestId;
    
    return config;
  },
  (error) => {
    console.error('Request error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      id: response.config.headers['X-Request-ID'],
      url: `${response.config.baseURL}${response.config.url}`,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      id: error.config?.headers?.['X-Request-ID'],
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
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