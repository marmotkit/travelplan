const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// 基本中間件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 配置
const corsOptions = {
  origin: ['http://localhost:5173', 'https://travel-planner-web.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Request-ID'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// 先處理 CORS
app.use(cors(corsOptions));

// 全局處理 OPTIONS 請求
app.options('*', cors(corsOptions));

// 調試中間件
app.use((req, res, next) => {
  console.log('請求信息:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  next();
});

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/plans', auth, planRoutes);
app.use('/api/trip-items', auth, tripItemRoutes);
app.use('/api/accommodations', auth, accommodationRoutes);
app.use('/api/budgets', auth, budgetRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/travel-info', auth, travelInfoRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 處理
app.use((req, res) => {
  console.log('404:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });
  
  // 對於 OPTIONS 請求，返回 200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.status(404).json({
    message: '找不到請求的資源',
    path: req.path,
    method: req.method
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    origin: req.headers.origin
  });
  res.status(err.status || 500).json({
    message: err.message || '伺服器內部錯誤'
  });
});

module.exports = app;