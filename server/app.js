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

// 從環境變數獲取允許的域名
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://travel-planner-web.onrender.com',
    /\.onrender\.com$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Request-ID',
    'X-Debug-Request'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  credentials: false,
  maxAge: 86400 // 24 小時
};

// 啟用 CORS
app.use(cors(corsOptions));

// 調試中間件
app.use((req, res, next) => {
  console.log('收到請求:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    host: req.headers.host,
    referer: req.headers.referer,
    headers: req.headers,
    body: req.method === 'POST' ? req.body : undefined,
    timestamp: new Date().toISOString()
  });
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 請求體解析中間件
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('請求體解析結果:', {
      path: req.path,
      body: req.body,
      contentType: req.headers['content-type'],
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    headers: req.headers
  });
});

// 測試路由
app.get('/api/test', (req, res) => {
  console.log('測試端點訪問:', {
    headers: req.headers,
    method: req.method,
    path: req.path
  });
  
  res.json({
    message: '測試端點正常工作',
    time: new Date().toISOString(),
    headers: req.headers
  });
});

// API routes
app.use('/api/users', (req, res, next) => {
  console.log('User routes hit:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
}, userRoutes);

app.use('/api/plans', planRoutes);
app.use('/api/trip-items', tripItemRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/travel-info', travelInfoRoutes);

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
  console.log('404 錯誤:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({
    message: '找不到請求的資源',
    path: req.path,
    method: req.method,
    time: new Date().toISOString()
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    headers: req.headers,
    body: req.method === 'POST' ? req.body : undefined,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({
    message: err.message || '服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;