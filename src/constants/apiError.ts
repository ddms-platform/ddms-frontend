// Numeric API error codes that mirror the backend `ErrorDefinitions.Codes`.
export const ApiErrorCode = {
  SUCCESS: 1000,

  VALIDATION_FAILED: 1100,
  EMAIL_ALREADY_EXISTS: 1200,
  ACCOUNT_INACTIVE: 1201,
  INVALID_CREDENTIALS: 1202,
  EMAIL_NOT_VERIFIED: 1204,
  RATE_LIMITED: 1209,

  TOKEN_INVALID: 1300,
  TOKEN_EXPIRED: 1301,
  REFRESH_TOKEN_INVALID: 1302,
  REFRESH_TOKEN_EXPIRED: 1303,
  REFRESH_TOKEN_REVOKED: 1304,
  REFRESH_TOKEN_REUSE_DETECTED: 1305,

  UNAUTHORIZED: 1401,
  FORBIDDEN: 1403,
  NOT_FOUND: 1404,

  UNCATEGORIZED: 9999,
} as const;

export type ApiErrorCodeValue =
  (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

// Refresh-token related failures: the session is unrecoverable and the user
// must sign in again.
export const REFRESH_FAILURE_CODES: number[] = [
  ApiErrorCode.REFRESH_TOKEN_INVALID,
  ApiErrorCode.REFRESH_TOKEN_EXPIRED,
  ApiErrorCode.REFRESH_TOKEN_REVOKED,
  ApiErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
];
