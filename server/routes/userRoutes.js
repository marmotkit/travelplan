const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');

// 處理 OPTIONS 請求
router.options('*', (req, res) => {
  res.status(200).end();
});

// 公開路由
router.post('/login', userController.login);

// 需要管理員權限的路由
router.use(auth, adminOnly);

router.route('/')
  .post(userController.createUser)
  .get(userController.getAllUsers);

router.route('/:id')
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;