import axios from 'axios';

const API_URL = '/api/users/login'; // 使用相對路徑

const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, {
      username,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('登入錯誤:', error);
    throw error.response?.data || error.message;
  }
};

export default {
  login
}; 