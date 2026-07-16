import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  HttpStatusCode,
} from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { env } from '@/config/env';
import { localStorageService } from './local-storage-service';
import { ApiErrorCode } from '@/constants/apiError';
import { routeName } from '@/constants/route-name';
import {
  clearAuthSession,
  refreshAccessTokenShared,
} from './auth-token-refresh';

// Global state for user disabled dialog
let showUserDisabledDialog: (() => void) | null = null;

export const setUserDisabledDialogHandler = (handler: (() => void) | null) => {
  showUserDisabledDialog = handler;
};
const apiUrl = env.API_URL;
const apiUrlPrefix = env.API_URL_PREFIX ?? 'api';
const baseUrlApi = `${apiUrl}/${apiUrlPrefix}`;

export interface ResponseBase<T = any> {
  status: number;
  data: T & DataResponseErrorBase;
}

export interface DataResponseErrorBase {
  code: number;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function clearSession() {
  clearAuthSession();
}

function redirectToSignIn() {
  if (window.location.pathname !== routeName.signIn) {
    window.location.href = routeName.signIn;
  }
}

// Silent refresh uses shared module (see auth-token-refresh.ts).

const api = axios.create({
  baseURL: baseUrlApi,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const Axios = axios.create({
  baseURL: baseUrlApi,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    throw error;
  },
);

api.interceptors.request.use((config) => {
  const token = localStorageService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status as number | undefined;
    const code = error.response?.data?.code as number | undefined;
    const originalConfig = error.config as RetriableConfig | undefined;

    if (status === HttpStatusCode.ServiceUnavailable) {
      if (window.location.pathname !== routeName.maintenance) {
        window.location.href = routeName.maintenance;
      }
      return Promise.reject(error);
    }

    // Disabled account: backend returns code 1201. Surface a dedicated dialog
    // (or toast) and end the session.
    if (code === ApiErrorCode.ACCOUNT_INACTIVE) {
      if (showUserDisabledDialog) {
        showUserDisabledDialog();
      } else {
        toast.error(i18n.t('error.USER_DISABLED'));
      }
      clearSession();
      redirectToSignIn();
      return Promise.reject(error);
    }

    if (
      status === HttpStatusCode.Unauthorized &&
      originalConfig &&
      !originalConfig._retry
    ) {
      originalConfig._retry = true;

      const newToken = await refreshAccessTokenShared();
      if (newToken) {
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api(originalConfig);
      }

      clearSession();
      redirectToSignIn();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .get(url, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .post(url, data, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .put(url, data, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .patch(url, data, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .delete(url, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

export const Api = { get, post, put, patch, del };
