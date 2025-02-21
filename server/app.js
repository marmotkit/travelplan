const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const { auth } = require('./middleware/auth');
const planRoutes = require('./routes/planRoutes');
const tripItemRoutes = require('./routes/tripItemRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const travelInfoRoutes = require('./routes/travelInfoRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 基本中間件
app.use(express.json());
app.use(morgan('dev'));

// 安全性中間件
app.use(helmet());

// 壓縮回應
app.use(compression());

// CORS 配置
app.use(cors({
  origin: 'https://travel-planner-web.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['Content-Type', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400
}));

// API 路由
app.use('/api', (req, res, next) => {
  // 設置響應頭部
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  // 修改 res.json 方法
  const originalJson = res.json;
  res.json = function(body) {
    // 確保響應是 JSON 格式
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = { data: body };
      }
    }
    return originalJson.call(this, body);
  };

  next();
});

// 註冊路由
app.use('/api/plans', planRoutes);
app.use('/api/trip-items', tripItemRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/travel-info', travelInfoRoutes);
app.use('/api/users', userRoutes);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200)
     .set('Content-Type', 'application/json; charset=utf-8')
     .json({
       status: 'ok',
       timestamp: new Date().toISOString(),
       environment: process.env.NODE_ENV
     });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;