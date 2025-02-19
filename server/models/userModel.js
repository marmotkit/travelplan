const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用戶名稱為必填項'],
    unique: true,
    trim: true,
    minlength: [3, '用戶名稱至少需要3個字符'],
    maxlength: [30, '用戶名稱不能超過30個字符']
  },
  email: {
    type: String,
    required: [true, '電子郵件為必填項'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請提供有效的電子郵件地址']
  },
  password: {
    type: String,
    required: [true, '密碼為必填項'],
    minlength: [6, '密碼至少需要6個字符'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, '名字不能超過50個字符']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, '姓氏不能超過50個字符']
  },
  avatar: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// 保存前加密密碼
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 比較密碼
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('密碼比較失敗');
  }
};

// 生成 JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
