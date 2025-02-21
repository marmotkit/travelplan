require('dotenv').config();

const config = {
    development: {
        port: process.env.PORT || 5001,
        mongoUri: process.env.MONGO_URI,
        jwtSecret: process.env.JWT_SECRET,
        corsOrigin: ['http://localhost:5173', 'http://127.0.0.1:5173']
    },
    production: {
        port: process.env.PORT || 5001,
        mongoUri: process.env.MONGO_URI,
        jwtSecret: process.env.JWT_SECRET,
        corsOrigin: 'https://travel-planner-web.onrender.com'
    }
};

module.exports = config[process.env.NODE_ENV || 'development']; 