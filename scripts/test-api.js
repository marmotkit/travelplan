const axios = require('axios');

const testAPI = async () => {
  try {
    const response = await axios.get('https://travelplan.onrender.com/api/test', {
      headers: {
        'Origin': 'https://travel-planner-web.onrender.com'
      }
    });
    console.log('API Test Response:', response.data);
  } catch (error) {
    console.error('API Test Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

testAPI(); 