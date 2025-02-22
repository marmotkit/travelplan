const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = require('./app');
const config = require('./config/config');

// 加載環境變數
dotenv.config();

// 直接使用環境變數
const port = config.port || 5001;
const mongoUri = config.mongoUri;
const nodeEnv = process.env.NODE_ENV || 'development';

console.log('Starting server with configuration:', {
  environment: nodeEnv,
  port: port,
  mongoUri: mongoUri ? mongoUri.replace(/:[^:]*@/, ':****@') : undefined,
  timestamp: new Date().toISOString()
});

console.log('Server initialization:', {
  workingDirectory: process.cwd(),
  nodeModules: require.resolve('jsonwebtoken'),
  timestamp: new Date().toISOString()
});

// 設置 mongoose 調試模式
mongoose.set('debug', true);

// Middleware
app.use(express.json());

// Routes
const planRoutes = require('./routes/planRoutes');
const tripItemRoutes = require('./routes/tripItemRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const travelInfoRoutes = require('./routes/travelInfoRoutes');

app.use('/api/plans', planRoutes);
app.use('/api/trip-items', tripItemRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/travel-info', travelInfoRoutes);

// 新增 health check endpoint
app.get('/health', (req, res) => {
  const healthInfo = {
    status: 'ok',
    time: new Date().toISOString(),
    env: nodeEnv,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    headers: req.headers
  };
  
  console.log('Health check:', healthInfo);
  res.json(healthInfo);
});

// 連接到 MongoDB
if (!mongoUri) {
  console.error('MongoDB URI is not defined');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('成功連接到 MongoDB');
})
.catch((err) => {
  console.error('MongoDB 連接失敗:', err);
  process.exit(1);
});

// 啟動服務器
app.listen(port, () => {
  console.log(`服務器運行在端口 ${port}`);
  console.log('環境:', process.env.NODE_ENV);
  console.log('CORS 來源:', config.corsOrigin);

  // 列出所有註冊的路由
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: '/api' + handler.route.path
          });
        }
      });
    }
  });

  console.log('Available routes:');
  console.log('Registered routes:', {
    count: routes.length,
    routes: routes,
    timestamp: new Date().toISOString()
  });
});

// 優雅關閉
const gracefulShutdown = () => {
  console.log('Received shutdown signal:', {
    timestamp: new Date().toISOString()
  });

  app.close(() => {
    console.log('HTTP server closed:', {
      timestamp: new Date().toISOString()
    });

    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed:', {
        timestamp: new Date().toISOString()
      });
      process.exit(0);
    }).catch(err => {
      console.error('Error closing MongoDB connection:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      process.exit(1);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 處理 deprecation 警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('punycode')) {
    return;
  }
  console.warn('Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
    timestamp: new Date().toISOString()
  });
});

// 添加基本的錯誤處理
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    timestamp: new Date().toISOString()
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    timestamp: new Date().toISOString()
  });
});

// CORS 錯誤處理
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    console.error('CORS 錯誤:', {
      error: err.message,
      origin: req.headers.origin,
      method: req.method
    });
    return res.status(403).json({ error: 'CORS 請求被拒絕' });
  }
  next(err);
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('錯誤處理中間件:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? '服務器錯誤' : err.message
  });
});

// 404 處理
app.use((req, res) => {
  console.log('404 處理:', {
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  
  res.status(404).json({ error: '找不到該資源' });
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    timestamp: new Date().toISOString()
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected:', {
    timestamp: new Date().toISOString()
  });
});