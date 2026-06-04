import { localStorageKey } from '@/constants/local-storage';

const saveAccessToken = (token: string) => {
  localStorage.setItem(localStorageKey.ACCESS_TOKEN, token);
};

const getAccessToken = (): string | null => {
  const token = localStorage.getItem(localStorageKey.ACCESS_TOKEN);
  if (!token) {
    return null;
  }

  if (token.startsWith('"') && token.endsWith('"')) {
    try {
      return JSON.parse(token) as string;
    } catch {
      localStorage.removeItem(localStorageKey.ACCESS_TOKEN);
      return null;
    }
  }

  return token;
};

const clearAccessToken = () => {
  localStorage.removeItem(localStorageKey.ACCESS_TOKEN);
};

const setItem = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getItem = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to parse localStorage data for key "${key}":`, error);
    // Clear invalid data
    localStorage.removeItem(key);
    return null;
  }
};

export const localStorageService = {
  setItem,
  getItem,
  saveAccessToken,
  getAccessToken,
  clearAccessToken,
};
