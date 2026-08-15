import type { User } from '@/data/user';
import type { IApiEnvelope, IAuthTokensResult } from '@/interfaces/auth';
import type { IProfileRes } from '@/interfaces/profile';
import { AuthServices } from '@/services/auth-service';
import { localStorageKey } from '@/constants/local-storage';

export function saveAuthTokens(tokens: IAuthTokensResult) {
  localStorage.setItem(localStorageKey.ACCESS_TOKEN, tokens.token);
  localStorage.setItem(localStorageKey.REFRESH_TOKEN, tokens.refreshToken);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(localStorageKey.REFRESH_TOKEN);
}

export function clearAuthTokens() {
  localStorage.removeItem(localStorageKey.ACCESS_TOKEN);
  localStorage.removeItem(localStorageKey.REFRESH_TOKEN);
  localStorage.removeItem(localStorageKey.USER);
}

// Best-effort server logout (revokes the refresh token) followed by a full
// local cleanup. Network/HTTP failures never block the client-side logout.
export async function performLogout(contextLogout: () => void): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await AuthServices.logout({ refreshToken });
    }
  } catch {
    // ignore — we still clear the session locally below
  } finally {
    clearAuthTokens();
    contextLogout();
  }
}

export function mapProfileToUser(profile: IProfileRes): User {
  return {
    id: profile.id,
    name: profile.fullName,
    email: profile.email,
    roles: (() => {
      const normalized = (profile.roles ?? [])
        .map((r) => r?.toLowerCase())
        .filter((r): r is string => ['user', 'owner', 'admin'].includes(r));
      return (normalized.length ? normalized : ['user']) as User['roles'];
    })(),
    avatar_url: profile.avatarUrl,
    phone: profile.phone,
    address: profile.address,
    hasOwnerProfile: profile.hasOwnerProfile,
    ownerProfileStatus: profile.ownerProfileStatus,
  };
}

type ErrorResponseData = {
  code?: number;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function getErrorData(error: unknown): ErrorResponseData | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as { response?: { data?: ErrorResponseData } }).response
      ?.data;
  }
  return undefined;
}

export function getApiErrorCode(error: unknown): number | undefined {
  return getErrorData(error)?.code;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = getErrorData(error);
  if (data?.fieldErrors) {
    const first = Object.values(data.fieldErrors).flat()[0];
    if (first) return first;
  }
  if (data?.message) {
    return data.message;
  }
  return fallback;
}

export async function loginWithTokens(
  tokens: IAuthTokensResult,
  login: (token: string, user: User) => void,
): Promise<User> {
  saveAuthTokens(tokens);
  const profileRes = await AuthServices.getProfile();

  if (
    profileRes.status !== 200 ||
    profileRes.data?.code !== 1000 ||
    !profileRes.data.result
  ) {
    clearAuthTokens();
    throw new Error('Failed to load profile');
  }

  const user = mapProfileToUser(profileRes.data.result);
  login(tokens.token, user);
  return user;
}

export function unwrapEnvelope<T>(data: IApiEnvelope<T> | undefined): T | null {
  if (!data || data.code !== 1000) {
    return null;
  }
  return data.result ?? null;
}
