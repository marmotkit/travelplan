const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 直接使用環境變數
const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/travel_planner',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: '24h',
  nodeEnv: process.env.NODE_ENV || 'development'
};

const planRoutes = require('./routes/planRoutes');
const tripItemRoutes = require('./routes/tripItemRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const travelInfoRoutes = require('./routes/travelInfoRoutes');
const app = require('./app');  // 使用 app.js 中的 app 實例

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://travel-planner-web.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/plans', planRoutes);
app.use('/api/trip-items', tripItemRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/travel-info', travelInfoRoutes);

// 新增 health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
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

// 處理 deprecation 警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('punycode')) {
    return;
  }
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// Database connection
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  dbName: 'travel_planner'
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// 添加在文件開頭
console.log('Current working directory:', process.cwd());
console.log('Node modules directory:', require.resolve('jsonwebtoken')); 