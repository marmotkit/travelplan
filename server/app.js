const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
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

// CORS 配置
const corsOptions = {
  origin: 'https://travel-planner-web.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 全局啟用 CORS
app.use(cors(corsOptions));

// 確保所有響應都包含 CORS 標頭
app.use((req, res, next) => {
  // 添加必要的 CORS 標頭
  res.header('Access-Control-Allow-Origin', 'https://travel-planner-web.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 如果是 OPTIONS 請求，直接返回 204
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  
  next();
});

// 其他中間件
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(compression());

// Serve 靜態文件
app.use(express.static(path.join(__dirname, '../client/dist')));

// API 中間件
const apiMiddleware = (req, res, next) => {
  // 添加 CORS 標頭
  res.header('Access-Control-Allow-Origin', 'https://travel-planner-web.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  
  // 其他標頭
  res.header({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  next();
};

// API 路由
const apiRouter = express.Router();
apiRouter.use(apiMiddleware);
apiRouter.use(cors(corsOptions)); // 在 API 路由中也啟用 CORS

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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 所有其他請求返回 index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
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

module.exports = app;