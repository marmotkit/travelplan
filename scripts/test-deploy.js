const axios = require('axios');
const https = require('https');

// 部署測試配置
const DEPLOY_URL = 'https://api.travel-planner.onrender.com';

// 創建自定義的 HTTPS agent，使用 Node.js 18 的配置
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384',
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  honorCipherOrder: true
});

const testDeploy = async () => {
  try {
    console.log('開始部署測試...');
    console.log('測試 URL:', DEPLOY_URL);
    console.log('Node.js 版本:', process.version);
    
    // 等待服務啟動
    console.log('\n等待服務啟動...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const axiosConfig = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Travel-Planner-Test/1.0',
        'Connection': 'keep-alive'
      },
      httpsAgent,
      timeout: 10000,
      validateStatus: status => status < 500
    };
    
    // 測試健康檢查
    console.log('\n1. 測試健康檢查路由...');
    try {
      const healthResponse = await axios.get(`${DEPLOY_URL}/health`, axiosConfig);
      console.log('健康檢查響應:', healthResponse.data);
    } catch (error) {
      console.warn('健康檢查失敗，繼續測試其他端點...');
      console.warn('錯誤詳情:', {
        message: error.message,
        status: error.response?.status,
        code: error.code
      });
    }

    // 測試 API
    console.log('\n2. 測試 API 路由...');
    try {
      const apiResponse = await axios.get(`${DEPLOY_URL}/api/test`, axiosConfig);
      console.log('API 測試響應:', apiResponse.data);
    } catch (error) {
      console.warn('API 測試失敗');
      console.warn('錯誤詳情:', {
        message: error.message,
        status: error.response?.status,
        code: error.code
      });
      throw error;
    }
    
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