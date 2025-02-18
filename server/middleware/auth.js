const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_jwt_secret';

// 認證中間件
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '認證失敗', error: error.message });
  }
};

// 管理員權限中間件
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理員權限' });
  }
  next();
};

module.exports = {
  auth,
  adminOnly
}; 