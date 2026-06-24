import api from './api';
import type { ApiResponse } from './boatService';

export interface WalletBalanceResponse {
  balance: number;
}

export interface WalletWithdrawalResponse {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string | null;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const walletService = {
  getBalance: () =>
    api
      .get<ApiResponse<WalletBalanceResponse>>('/wallet/balance')
      .then((r) => r.data.result),

  getWithdrawals: () =>
    api
      .get<ApiResponse<WalletWithdrawalResponse[]>>('/wallet/withdrawals')
      .then((r) => r.data.result),

  requestWithdraw: (data: WithdrawRequest) =>
    api
      .post<
        ApiResponse<{ success: boolean; newBalance: number }>
      >('/wallet/withdraw', data)
      .then((r) => r.data.result),
};
