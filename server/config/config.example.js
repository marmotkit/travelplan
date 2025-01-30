require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: 'mongodb://localhost:27017/travel_planner',
  jwtSecret: 'your_jwt_secret_here'
};