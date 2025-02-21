const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
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

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://travel-planner-web.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 安全性中間件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://travel-planner-web.onrender.com", "https://travel-planner-api.onrender.com"],
      frameAncestors: ["'none'"]
    }
  }
}));

// 壓縮回應
app.use(compression());

// 路由
app.use('/api/plans', planRoutes);
app.use('/api/trip-items', tripItemRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/travel-info', travelInfoRoutes);
app.use('/api/users', userRoutes);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('錯誤:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || '服務器內部錯誤',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: '找不到請求的資源',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
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