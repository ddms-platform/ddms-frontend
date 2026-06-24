import api from './api';
import type { ApiResponse } from './boatService';

export interface BookingRevenueItem {
  bookingId: string;
  tourName: string;
  customerName: string;
  bookingDate: string;
  totalPrice: number;
  status: string;
  commission: number;
}

export interface MaintenanceFeeItem {
  maintenanceId: string;
  boatName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
}

export interface DockRentalItem {
  boatId: string;
  boatName: string;
  registrationNumber: string;
  year: number;
  month: number;
  amount: number;
}

export interface PaymentHistoryItem {
  paymentId: string;
  amount: number;
  status: string;
  payosOrderCode: number;
  description?: string;
  createdAt: string;
  paidAt?: string;
}

export interface FinancialSummary {
  totalBookingRevenue: number;
  totalOwed: number;
  commissionOwed: number;
  maintenanceOwed: number;
  dockRentalOwed: number;
  totalPaid: number;
  remainingBalance: number;
  bookings: BookingRevenueItem[];
  maintenances: MaintenanceFeeItem[];
  dockRentals: DockRentalItem[];
  paymentHistory: PaymentHistoryItem[];
}

export interface PaymentInitResult {
  checkoutUrl: string;
  orderCode: number;
  qrCode?: string;
  accountNumber?: string;
  accountName?: string;
  bin?: string;
}

export const billingService = {
  getFinancialSummary: () =>
    api
      .get<ApiResponse<FinancialSummary>>('/owner/billing/financial-summary')
      .then((r) => r.data.result),

  initiatePayment: () =>
    api
      .post<ApiResponse<PaymentInitResult>>('/owner/billing/pay')
      .then((r) => r.data.result),
};
