const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('./middleware/auth');
const planRoutes = require('./routes/planRoutes');
const tripItemRoutes = require('./routes/tripItemRoutes');
const accommodationsRouter = require('./routes/accommodations');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const travelInfoRoutes = require('./routes/travelInfoRoutes');
const userRoutes = require('./routes/userRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');

const app = express();

// CORS 配置
app.use(cors({
  origin: 'https://travel-planner-web.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

app.use(express.json());

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 測試路由 - 確保在所有其他路由之前
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API 路由前綴
app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 公開路由
app.use('/api/users', userRoutes);

// 受保護的路由
app.use('/api/plans', auth, planRoutes);
app.use('/api/trip-items', auth, tripItemRoutes);
app.use('/api/accommodations', auth, accommodationRoutes);
app.use('/api/budgets', auth, budgetRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/travel-info', auth, travelInfoRoutes);

// 404 處理
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: '找不到該路徑',
    path: req.path,
    method: req.method
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: '伺服器錯誤',
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

module.exports = app; 