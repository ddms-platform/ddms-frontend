import axios from 'axios';
import { env } from '@/config/env';
import { localStorageKey } from '@/constants/local-storage';
import { ApiErrorCode } from '@/constants/apiError';

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem(localStorageKey.REFRESH_TOKEN);
  if (!refreshToken) return null;

  const baseUrlApi = `${env.API_URL}/${env.API_URL_PREFIX ?? 'api'}`;

  try {
    const res = await axios.post(
      `${baseUrlApi}/auth/refresh-token`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const data = res.data;
    if (data?.code === ApiErrorCode.SUCCESS && data.result?.token) {
      localStorage.setItem(localStorageKey.ACCESS_TOKEN, data.result.token);
      if (data.result.refreshToken) {
        localStorage.setItem(
          localStorageKey.REFRESH_TOKEN,
          data.result.refreshToken,
        );
      }
      return data.result.token as string;
    }
    return null;
  } catch {
    return null;
  }
}

/** Single shared refresh — avoids parallel refresh-token calls (reuse detection). */
export async function refreshAccessTokenShared(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function clearAuthSession() {
  localStorage.removeItem(localStorageKey.ACCESS_TOKEN);
  localStorage.removeItem(localStorageKey.REFRESH_TOKEN);
  localStorage.removeItem(localStorageKey.USER);
}
