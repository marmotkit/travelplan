const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');
const cors = require('cors');

// 處理 OPTIONS 請求
router.options('*', (req, res) => {
  res.status(200).end();
});

// CORS 配置
const corsOptions = {
  origin: ['http://localhost:5173', 'https://travel-planner-web.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Request-ID'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// 公開路由
router.route('/login')
  .options(cors(corsOptions))  // 明確處理 OPTIONS
  .post(cors(corsOptions), userController.login);  // 為 POST 請求也添加 CORS

// 需要管理員權限的路由
router.use(auth, adminOnly);

router.route('/')
  .post(userController.createUser)
  .get(userController.getAllUsers);

router.route('/:id')
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;