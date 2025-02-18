import axios from 'axios';

// 移除 /api 後綴，因為我們會在各個請求中添加
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'https://travelplan.onrender.com';

if (!BASE_URL) {
  console.error('API URL not configured! Please check .env file');
}

// 創建 axios 實例
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false  // 改為 false，因為我們使用 token 認證
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - token:', token ? '存在' : '不存在');
    console.log('Request config:', config);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加時間戳防止緩存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      // 服務器回應了請求，但狀態碼不在 2xx 範圍內
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // 請求已發出，但沒有收到回應
      console.error('No response received:', error.request);
    } else {
      // 在設置請求時發生了錯誤
      console.error('Error setting up request:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
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