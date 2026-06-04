import { Api, Axios } from './axios';
import type { IProfileRes } from '@/interfaces/profile';
import type {
  IApiEnvelope,
  IAuthTokensResult,
  IGoogleLoginPayload,
  ILoginPayload,
  ILogoutPayload,
  IRegisterPayload,
  IRegisterRes,
  IResendVerificationEmailPayload,
  IVerifyEmailPayload,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  IRefreshTokenPayload,
  IChangePasswordPayload,
} from '@/interfaces/auth';

const login = (payload: ILoginPayload) => {
  return Axios.post<IApiEnvelope<IAuthTokensResult>>('/auth/login', payload);
};

const register = (payload: IRegisterPayload) => {
  return Axios.post<IApiEnvelope<IRegisterRes>>('/auth/register', payload);
};

const verifyEmail = (payload: IVerifyEmailPayload) => {
  return Axios.post<
    IApiEnvelope<{ message: string; alreadyVerified: boolean }>
  >('/auth/verify-email', payload);
};

const resendVerificationEmail = (payload: IResendVerificationEmailPayload) => {
  return Axios.post<
    IApiEnvelope<{ message: string; verificationLink?: string | null }>
  >('/auth/resend-verification-email', payload);
};

const forgotPassword = (payload: IForgotPasswordPayload) => {
  return Axios.post<
    IApiEnvelope<{ message: string; verificationLink?: string | null }>
  >('/auth/forgot-password', payload);
};

const resetPassword = (payload: IResetPasswordPayload) => {
  return Axios.post<IApiEnvelope<{ message: string }>>(
    '/auth/reset-password',
    payload,
  );
};

const changePassword = (payload: IChangePasswordPayload) => {
  return Api.post<IApiEnvelope<{ message: string }>>(
    '/auth/change-password',
    payload,
  );
};

const googleLogin = (payload: IGoogleLoginPayload) => {
  return Axios.post<IApiEnvelope<IAuthTokensResult>>(
    '/auth/google-login',
    payload,
  );
};

const refreshToken = (payload: IRefreshTokenPayload) => {
  return Axios.post<IApiEnvelope<IAuthTokensResult>>(
    '/auth/refresh-token',
    payload,
  );
};

const getProfile = () => {
  return Api.get<IApiEnvelope<IProfileRes>>('/auth/me');
};

// Revokes the supplied refresh token server-side. Idempotent on the backend.
const logout = (payload: ILogoutPayload) => {
  return Api.post('/auth/logout', payload);
};

// Revokes every active refresh token for the current user (requires Bearer).
const logoutAll = () => {
  return Api.post('/auth/logout-all');
};

export const AuthServices = {
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  googleLogin,
  refreshToken,
  getProfile,
  logout,
  logoutAll,
};
