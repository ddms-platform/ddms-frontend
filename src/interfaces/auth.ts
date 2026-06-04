import type { User } from '@/data/user';

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ILoginRes {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IRegisterRes {
  requiresEmailVerification: boolean;
  email: string;
  message: string;
  verificationLink?: string | null;
}

export interface IVerifyEmailPayload {
  token: string;
}

export interface IResendVerificationEmailPayload {
  email: string;
}

export interface IGoogleLoginPayload {
  idToken: string;
}

export interface IApiEnvelope<T> {
  code: number;
  result: T;
}

export interface IAuthTokensResult {
  token: string;
  refreshToken: string;
  authenticated: boolean;
  expiresInSeconds: number;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface ILogoutPayload {
  refreshToken: string;
}

export interface IRefreshTokenRes {
  accessToken: string;
  refreshToken: string;
}
