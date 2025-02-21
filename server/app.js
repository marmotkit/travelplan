const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
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

// 基本中間件
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(compression());

// CORS 配置必須在其他中間件之前
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://travel-planner-web.onrender.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['Content-Type', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// 預檢請求處理
app.options('*', cors(corsOptions));

// API 中間件
const apiMiddleware = (req, res, next) => {
  // 設置響應頭部
  res.header({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  // 修改 res.json 方法
  const originalJson = res.json;
  res.json = function(body) {
    // 確保響應是 JSON 格式
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = { data: body };
      }
    }
    return originalJson.call(this, body);
  };

  next();
};

// API 路由
const apiRouter = express.Router();
apiRouter.use(apiMiddleware);

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

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  
  // CORS 錯誤處理
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 啟動時打印配置
console.log('CORS 配置:', {
  allowedOrigins: ['https://travel-planner-web.onrender.com'],
  methods: corsOptions.methods,
  allowedHeaders: corsOptions.allowedHeaders,
  exposedHeaders: corsOptions.exposedHeaders,
  credentials: corsOptions.credentials,
  maxAge: corsOptions.maxAge
});

module.exports = app;