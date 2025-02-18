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
const allowedOrigins = [
  'https://travel-planner-web.onrender.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// CORS 配置
app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    
    // 允許沒有 origin 的請求（例如 Postman）
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// 預檢請求處理
app.options('*', (req, res) => {
  console.log('Handling OPTIONS request');
  res.sendStatus(204);
});

// Body parser
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/users', userRoutes);
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

// 測試路由 - 放在 API 路由下
app.get('/api/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 處理
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: '找不到該路徑',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
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