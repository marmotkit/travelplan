const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const app = require('./app');  // 使用 app.js 中的 app 實例

// 處理 deprecation 警告
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('punycode')) {
    return;
  }
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// MongoDB 連接配置
const mongoUri = 'mongodb+srv://marmotkk2013:Kingmax00@marmotkit.dlnje.mongodb.net/travel_planner?retryWrites=true&w=majority&appName=marmotkit';

console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB');
  
  // 列出所有集合
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Available collections:', collections.map(c => c.name));
      
      // 查詢每個集合的文檔數量
      collections.forEach(collection => {
        mongoose.connection.db.collection(collection.name).countDocuments()
          .then(count => {
            console.log(`Collection ${collection.name} has ${count} documents`);
          })
          .catch(err => {
            console.error(`Error counting documents in ${collection.name}:`, err);
          });
      });
    })
    .catch(err => {
      console.error('Error listing collections:', err);
    });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// 監聽數據庫連接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// 未捕獲的 Promise 錯誤
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 啟動服務器
const port = config.port;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('API URL:', `http://localhost:${port}/api`);
});