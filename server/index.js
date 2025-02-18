const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = require('./app');

// 加載環境變數
dotenv.config();

// 直接使用環境變數
const port = process.env.PORT || 5001;
const mongoUri = process.env.MONGO_URI;
const nodeEnv = process.env.NODE_ENV || 'development';

console.log('Starting server with configuration:', {
  environment: nodeEnv,
  port: port,
  mongoUri: mongoUri ? mongoUri.replace(/:[^:]*@/, ':****@') : undefined,
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body
    },
    timestamp: new Date().toISOString()
  });
  
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

// 添加更多日誌
console.log('Server initialization:', {
  workingDirectory: process.cwd(),
  nodeModules: require.resolve('jsonwebtoken'),
  timestamp: new Date().toISOString()
});

// 連接到 MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connection successful:', {
      readyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
    
    // 啟動服務器
    app.listen(port, '0.0.0.0', () => {
      console.log('Server started:', {
        port: port,
        environment: nodeEnv,
        timestamp: new Date().toISOString()
      });
      
      // 列出所有註冊的路由
      console.log('Available routes:');
      const routes = [];
      app._router.stack.forEach((r) => {
        if (r.route && r.route.path) {
          routes.push({
            method: r.route.stack[0].method.toUpperCase(),
            path: r.route.path
          });
        }
      });
      console.log('Registered routes:', {
        count: routes.length,
        routes: routes,
        timestamp: new Date().toISOString()
      });
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
    process.exit(1);
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

// 添加進程終止處理
process.on('SIGTERM', () => {
  console.log('SIGTERM received:', {
    timestamp: new Date().toISOString()
  });
  
  mongoose.connection.close()
    .then(() => {
      console.log('Graceful shutdown completed:', {
        timestamp: new Date().toISOString()
      });
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during shutdown:', {
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        timestamp: new Date().toISOString()
      });
      process.exit(1);
    });
});