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

// 移除其他所有 CORS 相關配置，只保留這個最基本的
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
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

// API 路由
const apiRouter = express.Router();

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