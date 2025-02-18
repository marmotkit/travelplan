const axios = require('axios');

const BASE_URL = process.env.API_URL || 'https://travelplan.onrender.com';
const LOCAL_URL = 'http://localhost:5001';

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
        const healthResponse = await axios.get(`${url}/health`);
        console.log('健康檢查響應:', healthResponse.data);

        // 測試 API
        const apiResponse = await axios.get(`${url}/api/test`);
        console.log('API 測試響應:', apiResponse.data);
        
        // 如果成功就不需要測試下一個 URL
        break;
      } catch (error) {
        console.log(`${url} 測試失敗:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
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
      data: error.response?.data
    });
    process.exit(1);
  }
};

testAPI(); 