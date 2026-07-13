import axios, { type InternalAxiosRequestConfig } from 'axios';
import { localStorageKey } from '@/constants/local-storage';
import { refreshAccessTokenShared } from './auth-token-refresh';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'https://localhost:7161/api',
  headers: { 'Content-Type': 'application/json' },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(localStorageKey.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem('i18nextLng') || 'vi';
  config.headers['Accept-Language'] = lang;

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status as number | undefined;
    const original = err.config as RetriableConfig | undefined;
    const message =
      err.response?.data?.message ||
      err.response?.data?.title ||
      'Đã xảy ra lỗi';

    // Stale JWT after role change (e.g. owner approved) → refresh once and retry.
    if (
      (status === 401 || status === 403) &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh-token')
    ) {
      original._retry = true;
      const newToken = await refreshAccessTokenShared();
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(new Error(message));
  },
);

export default api;
