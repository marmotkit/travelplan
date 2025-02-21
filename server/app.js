const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
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

// 安全性中間件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://travel-planner-web.onrender.com", "https://travel-planner-api.onrender.com"],
      frameAncestors: ["'none'"]
    }
  }
}));

// 壓縮回應
app.use(compression());

// 調試中間件
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // 監聽響應完成事件
  res.on('finish', () => {
    console.log('Response:', {
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      timestamp: new Date().toISOString()
    });
  });

  next();
});

// CORS 中間件
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'https://travel-planner-web.onrender.com') {
    // 基本 CORS 頭部
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type, X-Request-ID',
      'Vary': 'Origin, Accept-Encoding, Access-Control-Request-Headers'
    });

    // 添加快取控制頭部
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'CDN-Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Cloudflare-CDN-Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    // 確保預檢響應包含所有必要的頭部
    if (req.headers['access-control-request-headers']) {
      res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    }
    if (req.headers['access-control-request-method']) {
      res.set('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
    }
    res.set('Content-Length', '0');
    res.status(204).end();
    return;
  }

  next();
};

// API 路由
const apiRouter = express.Router();

// 為所有 API 路由設置 CORS 和內容類型
apiRouter.use(corsMiddleware);
apiRouter.use((req, res, next) => {
  // 在請求開始時設置響應頭
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  
  // 攔截 send 方法
  const originalSend = res.send;
  res.send = function(body) {
    // 確保響應是 JSON 格式
    if (body && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = { data: body };
      }
    }
    
    // 重新設置內容類型頭部
    this.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'CDN-Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Cloudflare-CDN-Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return originalSend.call(this, JSON.stringify(body));
  };

  next();
});

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
  res.status(200)
     .set('Content-Type', 'application/json; charset=utf-8')
     .json({
       status: 'ok',
       timestamp: new Date().toISOString(),
       environment: process.env.NODE_ENV
     });
});

// 404 處理
app.use((req, res) => {
  res.status(404)
     .set('Content-Type', 'application/json; charset=utf-8')
     .json({ error: 'Not Found' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  res.status(err.status || 500)
     .set('Content-Type', 'application/json; charset=utf-8')
     .json({
       error: err.message || 'Internal Server Error'
     });
});

// 根路由
app.get('/', (req, res) => {
  res.status(200)
     .set('Content-Type', 'application/json; charset=utf-8')
     .json({ 
       message: 'Travel Planner API',
       version: '1.0.0',
       timestamp: new Date().toISOString()
     });
});

module.exports = app;