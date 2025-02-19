const express = require('express');
const cors = require('cors');
const app = express();

// CORS 配置
const corsOptions = {
  origin: 'https://travel-planner-web.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  credentials: true,
  optionsSuccessStatus: 204
};

// 啟用 CORS
app.use(cors(corsOptions));

// 處理 preflight 請求
app.options('*', cors(corsOptions));

// 解析 JSON
app.use(express.json());

// 登入路由 - 注意這裡改為 /api/users/login
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // 登入邏輯...
    res.status(200).json({
      success: true,
      message: '登入成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: '伺服器錯誤'
  });
});

// 處理 404 錯誤
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到請求的資源'
  });
});

// 其他路由... 