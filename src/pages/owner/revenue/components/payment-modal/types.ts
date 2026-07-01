export type PayStep = 'breakdown' | 'waiting' | 'success';

export interface PaymentInfo {
  orderCode: number | null;
  checkoutUrl: string;
  amount: number;
  bin: string;
  accountNumber: string;
  accountName: string;
  description: string;
}
