const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  try {
    // 從請求頭中讀取用戶信息
    const userRole = req.headers['x-user-role'];
    const userName = req.headers['x-user-name'];

    if (!userRole || !userName) {
      return res.status(401).json({ message: '未提供用戶信息' });
    }

    // 設置用戶信息
    req.user = {
      username: userName,
      role: userRole
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: '伺服器錯誤' });
  }
};

exports.adminOnly = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: '需要管理員權限' });
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ message: '伺服器錯誤' });
  }
};