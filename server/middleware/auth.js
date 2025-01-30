const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - token:', token ? '存在' : '不存在');
    
    if (!token) {
      console.log('Auth middleware - 無 token');
      return res.status(401).json({ message: '請先登入' });
    }
    
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('Auth middleware - token 驗證成功:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - 錯誤:', error);
    res.status(401).json({ message: '認證失敗', error: error.message });
  }
};

exports.adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理員權限' });
  }
  next();
}; 