const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    // 從請求頭獲取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: '未提供認證令牌',
          timestamp: new Date().toISOString()
        }
      });
    }

    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 檢查用戶是否存在
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: {
          message: '用戶不存在',
          timestamp: new Date().toISOString()
        }
      });
    }

    // 將用戶信息添加到請求對象
    req.user = user;
    next();
  } catch (error) {
    console.error('認證錯誤:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return res.status(401).json({
      error: {
        message: '無效的認證令牌',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// 檢查管理員權限的中間件
authMiddleware.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: '未認證的請求',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          message: '需要管理員權限',
          timestamp: new Date().toISOString()
        }
      });
    }

    next();
  } catch (error) {
    console.error('權限檢查錯誤:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      error: {
        message: '權限檢查失敗',
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = authMiddleware;
