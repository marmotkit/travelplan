const express = require('express');
const router = express.Router();
const cors = require('cors');
const dashboardController = require('../controllers/dashboardController');

// CORS 配置
const corsOptions = {
  origin: 'https://travel-planner-web.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400
};

// 在路由層面啟用 CORS
router.use(cors(corsOptions));

// 確保每個路由都有正確的 CORS 標頭
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://travel-planner-web.onrender.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  next();
});

// 處理 OPTIONS 請求
router.options('*', cors(corsOptions));

router.get('/yearly-stats', dashboardController.getYearlyStats);

router.get('/stats', cors(corsOptions), async (req, res) => {
  try {
    // ... 原有的邏輯
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary', cors(corsOptions), async (req, res) => {
  try {
    // ... 原有的邏輯
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 