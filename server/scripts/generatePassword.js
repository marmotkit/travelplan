const bcrypt = require('bcryptjs');

async function generateHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password:', password);
    console.log('Hashed Password:', hash);
}

// 生成 "kingmax00" 的加密密碼
generateHash('kingmax00');
