const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 直接使用環境變數，不再依賴 config.js
const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_jwt_secret';
const jwtExpiresIn = '24h';

exports.login = async (req, res) => {
  try {
    console.log('登入請求:', {
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'x-request-id': req.headers['x-request-id']
      }
    });

    const { username, password } = req.body;

    // 驗證請求體
    if (!username || !password) {
      console.log('缺少必要參數:', { username: !!username, password: !!password });
      return res.status(400).json({
        success: false,
        message: '請提供用戶名和密碼'
      });
    }

    // 查找用戶
    const user = await User.findOne({ username }).select('+password');
    console.log('查找用戶結果:', { 
      found: !!user,
      username,
      hasPassword: !!user?.password
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '登入失敗，請檢查您的帳號密碼'
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
    console.log('密碼驗證:', { 
      isValid: isValidPassword,
      username 
    });

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '登入失敗，請檢查您的帳號密碼'
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

    console.log('登入成功:', {
      username,
      role: user.role
    });

    // 返回成功響應
    res.json({
      success: true,
      message: '登入成功',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('登入錯誤:', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: '登入過程中發生錯誤'
    });
  }
};

// 創建用戶
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 檢查用戶名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用戶名已存在'
      });
    }

    // 創建新用戶
    const user = new User({
      username,
      password,
      role: role || 'user',
      isActive: true
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: '用戶創建成功',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('創建用戶錯誤:', error);
    res.status(500).json({
      success: false,
      message: '創建用戶時發生錯誤'
    });
  }
};

// 註冊用戶
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate request body
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: '請提供用戶名、密碼和電子郵件'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用戶名或電子郵件已被使用'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password, // password will be hashed by the User model pre-save middleware
      isActive: true,
      role: 'user'
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '註冊過程中發生錯誤'
    });
  }
};

// 獲取所有用戶
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('獲取用戶列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶列表時發生錯誤'
    });
  }
};

// 更新用戶
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { username, role, isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      message: '用戶更新成功',
      user
    });
  } catch (error) {
    console.error('更新用戶錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新用戶時發生錯誤'
    });
  }
};

// 刪除用戶
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      message: '用戶刪除成功'
    });
  } catch (error) {
    console.error('刪除用戶錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除用戶時發生錯誤'
    });
  }
};