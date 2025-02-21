require('dotenv').config();

const config = {
    // 資料庫配置
    db: {
        uri: process.env.MONGODB_URI
    },
    
    // 服務器配置
    server: {
        port: process.env.PORT || 5001,
        baseUrl: '/api'
    },

    // JWT 配置
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },

    // CORS 配置
    cors: {
        origins: ['https://travel-planner-web.onrender.com', 'http://localhost:5173']
    }
};

module.exports = config; 