const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 密碼加密中間件
userSchema.pre('save', async function(next) {
  try {
    // 只有在密碼被修改時才重新加密
    if (!this.isModified('password')) {
      return next();
    }

    console.log('加密密碼:', { 
      username: this.username,
      isNewUser: this.isNew
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    console.error('密碼加密錯誤:', {
      error: error.message,
      username: this.username
    });
    next(error);
  }
});

// 驗證密碼方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('比較密碼:', { 
      username: this.username,
      hasStoredPassword: !!this.password 
    });

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('密碼比較錯誤:', {
      error: error.message,
      username: this.username
    });
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;