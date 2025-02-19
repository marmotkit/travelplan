import axios from 'axios';

const BASE_URL = 'https://travelplan.onrender.com';
const API_URL = `${BASE_URL}/api/login`; // 修改為正確的路徑

const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, {
      username,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  login,
}; 