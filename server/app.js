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
  origin: [
    'https://travel-planner-web.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 添加額外的 CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Planner API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API 路由
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
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

// 其他 API 路由
app.use('/api/users', userRoutes);
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