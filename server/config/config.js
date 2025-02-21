const config = {
    // 資料庫配置
    db: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://marmotkk2013:Kingmax00@marmotkit.dlnje.mongodb.net/travel_planner?retryWrites=true&w=majority&appName=marmotkit'
    },
    
    // 服務器配置
    server: {
        port: process.env.PORT || 3000,
        baseUrl: '/api'
    },

    // JWT 配置
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    }
};

module.exports = config; 