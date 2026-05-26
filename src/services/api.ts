import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5015/api',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn Bearer token từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý lỗi toàn cục
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.response?.data?.title || 'Đã xảy ra lỗi';
    return Promise.reject(new Error(message));
  }
);

export default api;
