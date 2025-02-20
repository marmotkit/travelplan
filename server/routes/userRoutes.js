const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用戶管理路由
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;