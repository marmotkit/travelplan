const axios = require('axios');

const BASE_URL = process.env.API_URL || 'https://travelplan.onrender.com';
const LOCAL_URL = 'http://127.0.0.1:5001';  // 使用 IPv4 地址而不是 localhost

const testAPI = async () => {
  try {
    console.log('開始測試 API...');
    console.log('測試環境:', process.env.NODE_ENV || 'development');
    console.log('基礎 URL:', BASE_URL);
    
    // 嘗試遠程和本地測試
    const urls = [BASE_URL, LOCAL_URL];
    
    for (const url of urls) {
      console.log(`\n測試 ${url}...`);
      try {
        // 測試健康檢查
        console.log('測試健康檢查路由...');
        const healthResponse = await axios.get(`${url}/health`);
        console.log('健康檢查響應:', healthResponse.data);

        // 測試 API
        console.log('測試 API 路由...');
        const apiResponse = await axios.get(`${url}/api/test`);
        console.log('API 測試響應:', apiResponse.data);
        
        console.log(`\n${url} 測試成功！`);
        // 如果成功就不需要測試下一個 URL
        break;
      } catch (error) {
        console.log(`${url} 測試失敗:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        // 如果是最後一個 URL 也失敗，拋出錯誤
        if (url === urls[urls.length - 1]) {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('所有測試都失敗了:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    process.exit(1);
  }
};

// 添加錯誤處理
process.on('unhandledRejection', (error) => {
  console.error('未處理的 Promise 拒絕:', error);
  process.exit(1);
});

testAPI(); 