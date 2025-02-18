const axios = require('axios');
const https = require('https');

// 部署測試配置
const DEPLOY_URL = 'https://api.travel-planner.onrender.com';

// 創建自定義的 HTTPS agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,  // 在測試環境中允許自簽名證書
  secureProtocol: 'TLS_method',
  minVersion: 'TLSv1.2'
});

const testDeploy = async () => {
  try {
    console.log('開始部署測試...');
    console.log('測試 URL:', DEPLOY_URL);
    
    // 等待服務啟動
    console.log('等待服務啟動...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const axiosConfig = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Travel-Planner-Test/1.0'
      },
      httpsAgent,
      timeout: 10000
    };
    
    // 測試健康檢查
    console.log('\n1. 測試健康檢查路由...');
    const healthResponse = await axios.get(`${DEPLOY_URL}/health`, axiosConfig);
    console.log('健康檢查響應:', healthResponse.data);

    // 測試 API
    console.log('\n2. 測試 API 路由...');
    const apiResponse = await axios.get(`${DEPLOY_URL}/api/test`, axiosConfig);
    console.log('API 測試響應:', apiResponse.data);
    
    console.log('\n✅ 部署測試通過！');
    
  } catch (error) {
    console.error('\n❌ 部署測試失敗:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      headers: {
        request: error.config?.headers,
        response: error.response?.headers
      },
      code: error.code,
      errno: error.errno
    });
    process.exit(1);
  }
};

// 添加未處理的異常處理
process.on('unhandledRejection', (error) => {
  console.error('未處理的 Promise 拒絕:', error);
  process.exit(1);
});

testDeploy(); 