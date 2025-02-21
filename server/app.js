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

// 調試中間件
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // 監聽響應完成事件
  res.on('finish', () => {
    console.log('Response:', {
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      timestamp: new Date().toISOString()
    });
  });

  next();
});

// CORS 中間件
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'https://travel-planner-web.onrender.com') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
};

// API 路由
const apiRouter = express.Router();

// 為所有 API 路由設置 CORS 和內容類型
apiRouter.use(corsMiddleware);
apiRouter.use((req, res, next) => {
  // 強制設置 JSON 內容類型
  res.contentType('application/json');
  
  // 移除任何可能導致內容類型改變的頭部
  res.removeHeader('Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  next();
});

// 註冊 API 路由
apiRouter.use('/plans', planRoutes);
apiRouter.use('/trip-items', tripItemRoutes);
apiRouter.use('/accommodations', accommodationRoutes);
apiRouter.use('/budgets', budgetRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/travel-info', travelInfoRoutes);
apiRouter.use('/users', userRoutes);

// 掛載 API 路由
app.use('/api', apiRouter);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200)
     .contentType('application/json')
     .json({
       status: 'ok',
       timestamp: new Date().toISOString(),
       environment: process.env.NODE_ENV
     });
});

// 404 處理
app.use((req, res) => {
  res.status(404)
     .contentType('application/json')
     .json({ error: 'Not Found' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  res.status(err.status || 500)
     .contentType('application/json')
     .json({
       error: err.message || 'Internal Server Error'
     });
});

// 根路由
app.get('/', (req, res) => {
  res.status(200)
     .contentType('application/json')
     .json({ 
       message: 'Travel Planner API',
       version: '1.0.0',
       timestamp: new Date().toISOString()
     });
});

module.exports = app;