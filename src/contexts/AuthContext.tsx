import type { User, UserRole } from '@/data/user';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { localStorageKey } from '@/constants/local-storage';
import { AuthServices } from '@/services/auth-service';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const TOKEN_KEY = localStorageKey.ACCESS_TOKEN;
const USER_KEY = localStorageKey.USER;
const REFRESH_TOKEN_KEY = localStorageKey.REFRESH_TOKEN;
const USER_ROLES: UserRole[] = ['user', 'owner', 'admin'];

function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && USER_ROLES.includes(role as UserRole);
}

function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') return null;
  const lower = role.toLowerCase();
  return isUserRole(lower) ? (lower as UserRole) : null;
}

function normalizeUser(rawUser: unknown): User | null {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const user = rawUser as any;
  const name =
    typeof user.name === 'string'
      ? user.name
      : typeof user.fullName === 'string'
        ? user.fullName
        : undefined;
  const email = typeof user.email === 'string' ? user.email : undefined;

  if (!name || !email) return null;

  const roles = Array.isArray(user.roles)
    ? (user.roles
        .map(normalizeRole)
        .filter(
          (r: UserRole | null): r is UserRole => r !== null,
        ) as UserRole[])
    : [];

  return {
    id: typeof user.id === 'string' ? user.id : undefined,
    name,
    email,
    roles: roles.length > 0 ? roles : ['user'],
    ...(typeof user.avatar_url === 'string' && user.avatar_url !== 'null'
      ? { avatar_url: user.avatar_url }
      : typeof user.avatarUrl === 'string' && user.avatarUrl !== 'null'
        ? { avatar_url: user.avatarUrl }
        : {}),
    ...(typeof user.phone === 'string' ? { phone: user.phone } : {}),
    ...(typeof user.address === 'string' ? { address: user.address } : {}),
    ...(user.hasOwnerProfile === true ? { hasOwnerProfile: true } : {}),
  };
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const isAuthenticated = !!token;

  // Sync across browser tabs via the `storage` event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
        if (!e.newValue) setUser(null);
      }
      if (e.key === USER_KEY) {
        setUser(e.newValue ? normalizeUser(JSON.parse(e.newValue)) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // On app load: refresh access token (picks up role changes e.g. owner
  // approval) then reload profile from `/me`.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const refreshRes = await AuthServices.refreshToken({ refreshToken });
          if (
            !cancelled &&
            refreshRes.status === 200 &&
            refreshRes.data?.code === 1000 &&
            refreshRes.data.result?.token
          ) {
            const next = refreshRes.data.result;
            localStorage.setItem(TOKEN_KEY, next.token);
            localStorage.setItem(REFRESH_TOKEN_KEY, next.refreshToken);
            setToken(next.token);
          }
        } catch {
          // Keep existing access token; /me or next API call will handle auth failure.
        }
      }

      if (cancelled) return;

      const res = await AuthServices.getProfile();
      if (cancelled) return;
      if (res.status === 200 && res.data?.code === 1000 && res.data.result) {
        const fresh = normalizeUser(res.data.result);
        if (fresh) {
          setUser(fresh);
          localStorage.setItem(USER_KEY, JSON.stringify(fresh));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadUser = useCallback(async () => {
    try {
      const res = await AuthServices.getProfile();
      if (res.status === 200 && res.data?.code === 1000 && res.data.result) {
        const fresh = normalizeUser(res.data.result);
        if (fresh) {
          setUser(fresh);
          localStorage.setItem(USER_KEY, JSON.stringify(fresh));
        }
      }
    } catch (err) {
      console.error('Failed to reload user', err);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    const normalizedUser = normalizeUser(newUser);
    if (!normalizedUser) return;

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    setToken(newToken);
    setUser(normalizedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout, reloadUser }),
    [isAuthenticated, user, login, logout, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
