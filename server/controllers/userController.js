const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 直接使用環境變數，不再依賴 config.js
const jwtSecret = process.env.JWT_SECRET || 'your_very_secure_jwt_secret';
const jwtExpiresIn = '24h';

// 登入
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供用戶名和密碼'
      });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    user.password = undefined;
    res.json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入過程中發生錯誤'
    });
  }
};

// 登出
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: '成功登出'
    });
  } catch (error) {
    console.error('登出錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登出過程中發生錯誤'
    });
  }
};

// 獲取用戶資料
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶資料時發生錯誤'
    });
  }
};

// 更新用戶資料
exports.updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updateData = {};

    if (email) updateData.email = email;
    if (password) updateData.password = password;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新用戶資料時發生錯誤'
    });
  }
};

// 獲取儀表板統計
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // TODO: 實現實際的統計數據
    const stats = {
      totalTrips: 0,
      upcomingTrips: 0,
      completedTrips: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('獲取儀表板統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取儀表板統計時發生錯誤'
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