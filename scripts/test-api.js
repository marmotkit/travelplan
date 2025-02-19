const axios = require('axios');

// 只測試本地服務器
const LOCAL_URL = 'http://127.0.0.1:5001';

const testAPI = async () => {
  try {
    console.log('開始本地 API 測試...');
    console.log('測試 URL:', LOCAL_URL);
    
    // 測試健康檢查
    console.log('\n1. 測試健康檢查路由...');
    const healthResponse = await axios.get(`${LOCAL_URL}/health`);
    console.log('健康檢查響應:', healthResponse.data);

    // 測試 API
    console.log('\n2. 測試 API 路由...');
    const apiResponse = await axios.get(`${LOCAL_URL}/api/test`);
    console.log('API 測試響應:', apiResponse.data);
    
    console.log('\n✅ 所有測試通過！');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    process.exit(1);
  }
};

testAPI(); 