const config = {
    // 資料庫配置
    db: {
        host: 'localhost',
        port: 27017,
        database: 'travel_plan',
        uri: 'mongodb+srv://marmotkk2013:Kingmax00@marmotkit.dlnje.mongodb.net/travel_planner?retryWrites=true&w=majority&appName=marmotkit'
    },
    
    // 服務器配置
    server: {
        port: 3000,
        baseUrl: '/api'
    },

    // JWT 配置
    jwt: {
        secret: 'your-secret-key',
        expiresIn: '24h'
    }
};

module.exports = config; 