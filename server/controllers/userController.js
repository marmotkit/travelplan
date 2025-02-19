const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { 
      username,
      requestBody: req.body,
      hasPassword: !!password,
      passwordLength: password?.length
    });
    
    // 檢查用戶是否存在
    const user = await User.findOne({ username });
    console.log('User lookup result:', {
      found: !!user,
      username: user?.username,
      role: user?.role,
      hashedPassword: user?.password ? `${user.password.substring(0, 10)}...` : 'none'
    });
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: '用戶名或密碼錯誤' });
    }
    
    // 檢查密碼是否正確
    console.log('Attempting password verification...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', {
      isMatch,
      inputPasswordLength: password?.length,
      storedPasswordLength: user.password?.length,
      storedPasswordStart: user.password.substring(0, 10)
    });
    
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ message: '用戶名或密碼錯誤' });
    }
    
    // 如果都正確，創建 token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful:', {
      username,
      role: user.role
    });
    
    // 返回用戶信息和 token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '伺服器錯誤', error: error.message });
  }
};

// 只有管理員可以使用的用戶管理功能
exports.createUser = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    
    const user = new User({
      username,
      password,
      name,
      role: role || 'user'
    });
    
    await user.save();
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
    res.status(500).json({ message: '創建用戶失敗', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('收到獲取用戶列表請求');
    const users = await User.find({}, '-password');
    console.log('查詢到的用戶數量:', users.length);
    res.json(users);
  } catch (error) {
    console.error('獲取用戶列表失敗:', error);
    res.status(500).json({ message: '獲取用戶列表失敗', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
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
      return res.status(404).json({ message: '用戶不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '更新用戶失敗', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: '用戶已停用' });
  } catch (error) {
    res.status(500).json({ message: '停用用戶失敗', error: error.message });
  }
}; 