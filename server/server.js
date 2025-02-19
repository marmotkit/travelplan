const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: 'https://travel-planner-web.onrender.com', // 替換為您的前端網址
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'x-request-id'],
  credentials: true,
};

app.use(cors(corsOptions));

// 解析 JSON 請求
app.use(express.json());

// 登入路由
app.post('/api/login', (req, res) => {
  // 登入邏輯
});

// 其他路由... 