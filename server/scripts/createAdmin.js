const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');

async function recreateAdminUser() {
  try {
    console.log('正在連接數據庫...');
    await mongoose.connect(config.mongoUri);
    
    // 刪除舊的管理員帳號
    await User.deleteOne({ username: 'admin' });
    
    // 創建新的管理員帳號
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      name: '系統管理員',
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    console.log('管理員帳號重新創建成功');
    console.log('用戶名: admin');
    console.log('密碼: admin123');
    
    // 驗證密碼
    const isMatch = await admin.comparePassword('admin123');
    console.log('密碼驗證測試:', isMatch ? '成功' : '失敗');
    
  } catch (error) {
    console.error('操作失敗:', error);
  } finally {
    await mongoose.disconnect();
  }
}

recreateAdminUser(); 