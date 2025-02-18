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

// 簡化的 CORS 配置
app.use(cors({
  origin: true, // 允許所有來源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 公開路由
app.use('/api/users', userRoutes);

// 受保護的路由
app.use('/api/plans', auth, planRoutes);
app.use('/api/trip-items', auth, tripItemRoutes);
app.use('/api/accommodations', auth, accommodationRoutes);
app.use('/api/budgets', auth, budgetRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/travel-info', auth, travelInfoRoutes);

// 錯誤處理中間件
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