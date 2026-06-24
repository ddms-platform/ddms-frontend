import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'https://localhost:7161/api',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn Bearer token từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem('i18nextLng') || 'vi';
  config.headers['Accept-Language'] = lang;

  return config;
});

// Xử lý lỗi toàn cục
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.title ||
      'Đã xảy ra lỗi';
    return Promise.reject(new Error(message));
  },
);

export default api;
