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

// CORS 設置
app.use(cors({
  origin: ['http://localhost:5173', 'https://travel-planner-web.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Request-ID'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 調試中間件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
  next();
});

// 確保 OPTIONS 請求能被正確處理
app.options('*', cors());

// API 路由
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

// 404 處理
app.use((req, res) => {
  console.log('404:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin
  });
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
    method: req.method,
    path: req.path,
    origin: req.headers.origin
  });
  res.status(err.status || 500).json({
    message: err.message || '伺服器內部錯誤'
  });
});

module.exports = app;