import api from './api';
import type { ApiResponse } from './boatService';

export interface CreateBookingCabinRequest {
  cabinId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateBookingServiceRequest {
  serviceId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateBookingRequest {
  scheduleId: string;
  numPeople: number;
  /** Mã giảm giá. Server tự tra và tự tính mức giảm. */
  promotionCode?: string | null;
  notes?: string | null;
  cabins?: CreateBookingCabinRequest[];
  services?: CreateBookingServiceRequest[];
}

/** Bảng giá do server tính. Là nguồn sự thật duy nhất về số tiền phải trả. */
export interface BookingQuote {
  basePrice: number;
  cabinPrice: number;
  servicePrice: number;
  subtotal: number;
  promotionId?: string | null;
  promotionCode?: string | null;
  /** Mô tả mức giảm để hiển thị, ví dụ "Giảm 10%". */
  promotionDescription?: string | null;
  discountAmount: number;
  totalPrice: number;
}

export interface BookingResponse {
  id: string;
  scheduleId: string;
  numPeople: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  /** Thời điểm hết hạn giữ chỗ (chỉ có khi status = holding) — dùng để đếm ngược. */
  holdExpiredAt?: string | null;
}

export interface CabinAvailabilityResponse {
  cabinId: string;
  cabinName: string;
  capacity: number;
  price: number;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
}

export type BookingStatus =
  | 'PENDING'
  | 'UPCOMING'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UserBookingListItemResponse {
  id: string;
  tourId: string;
  tourTitle_vn: string;
  tourTitle_en: string;
  location_vn: string;
  location_en: string;
  image: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  bookingCode: string;
  canShowCheckInQr: boolean;
  createdAt: string;
}

export const bookingService = {
  createBooking: (data: CreateBookingRequest) =>
    api
      .post<ApiResponse<BookingResponse>>('/bookings', data)
      .then((r) => r.data.result),

  /** Giữ chỗ tạm thời (chưa thanh toán). Trả về holdExpiredAt để đếm ngược. */
  holdBooking: (data: CreateBookingRequest) =>
    api
      .post<ApiResponse<BookingResponse>>('/bookings/hold', data)
      .then((r) => r.data.result),

  getUserBookings: () =>
    api
      .get<ApiResponse<UserBookingListItemResponse[]>>('/bookings')
      .then((r) => r.data.result),

  getCabinAvailability: (scheduleId: string) =>
    api
      .get<
        ApiResponse<CabinAvailabilityResponse[]>
      >(`/bookings/schedules/${scheduleId}/cabins`)
      .then((r) => r.data.result),

  /** Áp mã giảm giá lên đơn đang chờ thanh toán. Trả về bảng giá đã tính lại. */
  applyPromotion: (bookingId: string, code: string) =>
    api
      .put<ApiResponse<BookingQuote>>(`/bookings/${bookingId}/promotion`, {
        code,
      })
      .then((r) => r.data.result),

  /** Gỡ mã giảm giá khỏi đơn, giá trở lại như cũ. */
  removePromotion: (bookingId: string) =>
    api
      .delete<ApiResponse<BookingQuote>>(`/bookings/${bookingId}/promotion`)
      .then((r) => r.data.result),

  confirmPayment: (bookingId: string) =>
    api
      .put<ApiResponse<{ success: boolean }>>(`/bookings/${bookingId}/pay`)
      .then((r) => r.data.result),

  cancelBooking: (bookingId: string) =>
    api
      .put<
        ApiResponse<{
          success: boolean;
          status: string;
          refunded: boolean;
          amountRefunded: number;
        }>
      >(`/bookings/${bookingId}/cancel`)
      .then((r) => r.data.result),
};
