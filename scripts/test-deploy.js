const axios = require('axios');

// 部署測試配置
const DEPLOY_URL = 'https://travel-planner-api.onrender.com';

const testDeploy = async () => {
  try {
    console.log('開始部署測試...');
    console.log('測試 URL:', DEPLOY_URL);
    
    // 等待服務啟動
    console.log('等待服務啟動...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 測試健康檢查
    console.log('\n1. 測試健康檢查路由...');
    const healthResponse = await axios.get(`${DEPLOY_URL}/health`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('健康檢查響應:', healthResponse.data);

    // 測試 API
    console.log('\n2. 測試 API 路由...');
    const apiResponse = await axios.get(`${DEPLOY_URL}/api/test`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('API 測試響應:', apiResponse.data);
    
    console.log('\n✅ 部署測試通過！');
    
  } catch (error) {
    console.error('\n❌ 部署測試失敗:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    process.exit(1);
  }
};

testDeploy(); 