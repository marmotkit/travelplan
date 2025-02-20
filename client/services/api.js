import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

if (!API_URL) {
  console.error('API URL not configured! Please check .env file');
}

// 創建一個默認的用戶
const defaultUser = {
  username: 'marmot',
  name: '梁坤棠',
  role: 'admin'
};

// 創建 axios 實例
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-User-Role': defaultUser.role,
    'X-User-Name': defaultUser.username
  }
});

export const planApi = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
  downloadPDF: (id) => api.get(`/plans/${id}/pdf`, { responseType: 'blob' }),
};

export const tripItemApi = {
  getAll: (planId) => api.get(`/trip-items?planId=${planId}`),
  getByActivity: (activityId) => api.get(`/trip-items/activity/${activityId}`),
  create: (data) => api.post('/trip-items', data),
  update: (id, data) => api.put(`/trip-items/${id}`, data),
  delete: (id) => api.delete(`/trip-items/${id}`)
};

export const accommodationApi = {
  getAll: () => api.get('/accommodations'),
  getById: (id) => api.get(`/accommodations/${id}`),
  getByActivity: (activityId) => api.get(`/accommodations/activity/${activityId}`),
  create: (data) => api.post('/accommodations', data),
  update: (id, data) => api.put(`/accommodations/${id}`, data),
  delete: (id) => api.delete(`/accommodations/${id}`),
  patch: (path, data) => api.patch(`/accommodations${path}`, data),
  saveItems: (activityId, items) => api.post('/accommodations/batch', { activityId, items })
};

export const budgetApi = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  getByActivity: (activityId) => api.get(`/budgets/activity/${activityId}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  updateStatus: (id, status) => api.patch(`/budgets/${id}/status`, { status }),
  saveItems: (activityId, items, summary) => api.post('/budgets/batch', { activityId, items, summary })
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getStats: () => api.get('/dashboard/stats')
};

export const travelInfoApi = {
  getAll: () => api.get('/travel-info'),
  getByActivity: (activityId) => api.get(`/travel-info/activity/${activityId}`),
  getWeather: (city) => api.get(`/travel-info/weather?city=${city}`),
  getCurrency: (from, to) => api.get(`/travel-info/currency?from=${from}&to=${to}`),
  create: (data) => api.post('/travel-info', data),
  update: (id, data) => api.put(`/travel-info/${id}`, data),
  delete: (id) => api.delete(`/travel-info/${id}`)
}; 