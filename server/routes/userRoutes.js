const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// 處理 OPTIONS 請求
router.options('*', (req, res) => {
  res.status(200).end();
});

// 公開路由
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// 需要認證的路由
router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/dashboard/stats', userController.getDashboardStats);

// 管理員路由
router.get('/', authMiddleware.isAdmin, userController.getAllUsers);
router.get('/:id', authMiddleware.isAdmin, userController.getUserById);
router.put('/:id', authMiddleware.isAdmin, userController.updateUser);
router.delete('/:id', authMiddleware.isAdmin, userController.deleteUser);

module.exports = router;