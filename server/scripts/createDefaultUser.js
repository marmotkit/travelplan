const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

async function createDefaultUser() {
  try {
    await mongoose.connect(config.db.uri);
    
    const defaultUser = {
      username: 'marmot',
      password: 'kingmax00',
      email: 'marmot@example.com',
      role: 'admin'
    };

    // 檢查用戶是否已存在
    const existingUser = await User.findOne({ username: defaultUser.username });
    if (existingUser) {
      console.log('預設用戶已存在');
      return;
    }

    // 創建新用戶
    const user = new User(defaultUser);
    await user.save();
    console.log('預設用戶創建成功');

  } catch (error) {
    console.error('創建預設用戶失敗:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultUser(); 