import axios from 'axios';

const API_URL = '/api/login'; // 使用相對路徑

const login = (username, password) => {
  return axios.post(API_URL, {
    username,
    password,
  });
};

export default {
  login,
}; 