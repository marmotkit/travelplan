const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('開始測試 API...');
    
    // 測試根路由
    const rootResponse = await axios.get('https://travelplan.onrender.com');
    console.log('根路由響應:', rootResponse.data);

    // 測試健康檢查
    const healthResponse = await axios.get('https://travelplan.onrender.com/health');
    console.log('健康檢查響應:', healthResponse.data);

    // 測試 API
    const apiResponse = await axios.get('https://travelplan.onrender.com/api/test');
    console.log('API 測試響應:', apiResponse.data);

  } catch (error) {
    console.error('測試失敗:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      path: error.config?.url
    });
  }
};

testAPI(); 