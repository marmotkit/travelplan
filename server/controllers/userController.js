const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 直接使用環境變數，不再依賴 config.js
const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_jwt_secret';
const jwtExpiresIn = '24h';

exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', {
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      contentType: req.headers['content-type'],
      timestamp: new Date().toISOString()
    });

    const { username, password } = req.body;

    // 驗證請求體
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供用戶名和密碼'
      });
    }

    // 查找用戶
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤'
      });
    }

    // 檢查帳戶狀態
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: '帳戶已被停用'
      });
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤'
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // 移除敏感資訊
    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    };

    console.log('Login successful:', {
      userId: user._id,
      username: user.username,
      role: user.role,
      timestamp: new Date().toISOString()
    });

    // 返回成功響應
    res.json({
      success: true,
      message: '登入成功',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      message: '登入過程中發生錯誤'
    });
  }
};

// 只有管理員可以使用的用戶管理功能
exports.createUser = async (req, res) => {
  try {
    console.log('Create user endpoint hit:', {
      path: req.path,
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const { username, password, name, role } = req.body;
    
    const user = new User({
      username,
      password,
      name,
      role: role || 'user'
    });
    
    await user.save();
    console.log('User created:', {
      userId: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      timestamp: new Date().toISOString()
    });
    res.status(201).json({
      message: '用戶創建成功',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: '創建用戶失敗', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('Get all users endpoint hit:', {
      path: req.path,
      method: req.method,
      headers: req.headers,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const users = await User.find({}, '-password');
    console.log('Users retrieved:', {
      count: users.length,
      timestamp: new Date().toISOString()
    });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: '獲取用戶列表失敗', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    console.log('Update user endpoint hit:', {
      path: req.path,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      timestamp: new Date().toISOString()
    });

    const { id } = req.params;
    const { name, role, isActive, password } = req.body;
    
    const updateData = { name, role, isActive };
    if (password) {
      updateData.password = password;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: '用戶不存在' });
    }

    console.log('User updated:', {
      userId: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      timestamp: new Date().toISOString()
    });
    res.json(user);
  } catch (error) {
    console.error('Update user error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: '更新用戶失敗', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log('Delete user endpoint hit:', {
      path: req.path,
      method: req.method,
      headers: req.headers,
      params: req.params,
      timestamp: new Date().toISOString()
    });

    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isActive: false });
    console.log('User deleted:', {
      userId: id,
      timestamp: new Date().toISOString()
    });
    res.json({ message: '用戶已停用' });
  } catch (error) {
    console.error('Delete user error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: '停用用戶失敗', error: error.message });
  }
}; 