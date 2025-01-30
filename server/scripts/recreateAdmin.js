const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');

async function recreateAdminUser() {
  try {
    console.log('正在連接數據庫...');
    console.log('MongoDB URI:', config.mongoUri);
    
    await mongoose.connect(config.mongoUri);
    console.log('數據庫連接成功');
    
    // 刪除所有現有用戶
    await User.deleteMany({});
    console.log('清除所有現有用戶');
    
    // 創建新的管理員帳號 - 不需要手動加密密碼
    const admin = new User({
      username: 'admin',
      password: 'admin123',  // 原始密碼，會被 pre-save 中間件自動加密
      name: '系統管理員',
      role: 'admin',
      isActive: true
    });
    
    const savedAdmin = await admin.save();
    console.log('保存的管理員信息:', {
      id: savedAdmin._id,
      username: savedAdmin.username,
      hashedPassword: savedAdmin.password,
      role: savedAdmin.role
    });
    
    // 測試密碼驗證
    const testUser = await User.findOne({ username: 'admin' });
    const isMatch = await testUser.comparePassword('admin123');
    
    console.log('密碼驗證測試:', {
      userFound: !!testUser,
      passwordMatch: isMatch,
      storedHash: testUser?.password
    });
    
    if (isMatch) {
      console.log('管理員帳號創建成功！');
      console.log('用戶名: admin');
      console.log('密碼: admin123');
    } else {
      console.error('密碼驗證失敗！');
    }
    
  } catch (error) {
    console.error('操作失敗:', error);
    console.error('錯誤詳情:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('數據庫連接已關閉');
    process.exit(0);
  }
}

recreateAdminUser(); 