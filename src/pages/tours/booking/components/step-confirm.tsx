import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoomOption } from '../types';
import type {
  TourItemResponse,
  TourServiceResponse,
} from '@/services/tourService';
import {
  bookingService,
  type BookingPaymentInit,
  type BookingQuote,
} from '@/services/bookingService';
import SummaryPanel from './step-confirm/SummaryPanel';
import PaymentPanel from './step-confirm/PaymentPanel';
import HoldCountdown from './step-confirm/HoldCountdown';

interface StepConfirmProps {
  tour: TourItemResponse;
  selectedDate: string;
  selectedTime: string;
  selectedRoom: RoomOption | null;
  guests: number;
  tourPrice: number;
  roomPrice: number;
  servicePrice: number;
  totalPrice: number;
  selectedServices: TourServiceResponse[];
  selectedSchedule: any;
  onConfirm: () => void;
}

export default function StepConfirm({
  tour,
  selectedDate,
  selectedTime,
  selectedRoom,
  guests,
  tourPrice,
  roomPrice,
  servicePrice,
  totalPrice,
  selectedServices,
  selectedSchedule,
  onConfirm,
}: StepConfirmProps) {
  const { t } = useTranslation();
  const [isPaid, setIsPaid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Thông tin cổng PayOS trả về. Không có nó thì không thanh toán được —
  // và không có đường nào khác để đơn chuyển sang đã thanh toán.
  const [payment, setPayment] = useState<BookingPaymentInit | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const [dbBookingId, setDbBookingId] = useState<string | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(true);
  // Thời điểm hết hạn giữ chỗ (null nếu tour quá sát giờ, phải thanh toán ngay).
  const [holdExpiredAt, setHoldExpiredAt] = useState<string | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);
  // Bảng giá server trả về sau khi áp mã giảm giá; null khi chưa áp mã nào.
  const [quote, setQuote] = useState<BookingQuote | null>(null);

  // Số tiền thật sự phải trả: ưu tiên con số server tính.
  const payableTotal = quote ? quote.totalPrice : totalPrice;

  const bookingCode = useMemo(() => {
    const source = `${tour.id}-${selectedSchedule?.id}-${selectedDate}-${selectedTime}-${guests}`;
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) % 900000;
    }
    return `DDMS${String(100000 + hash).padStart(6, '0')}`;
  }, [guests, selectedDate, selectedSchedule?.id, selectedTime, tour.id]);

  const displayCode = dbBookingId
    ? dbBookingId.slice(0, 8).toUpperCase()
    : bookingCode;

  useEffect(() => {
    let active = true;
    const createDbBooking = async () => {
      try {
        setIsCreatingBooking(true);
        // Không gửi giá lên nữa — server tự tính toàn bộ từ dữ liệu trong DB.
        const payload = {
          scheduleId: selectedSchedule.id,
          numPeople: guests,
          notes: '',
          cabins: selectedRoom
            ? [{ cabinId: selectedRoom.id, quantity: 1, unitPrice: 0 }]
            : [],
          services: selectedServices.map((service) => ({
            serviceId: service.id,
            quantity: 1,
            unitPrice: 0,
          })),
        };
        // Ưu tiên GIỮ CHỖ (giữ ghế trong lúc khách nhập thẻ) — có đồng hồ đếm ngược.
        // Nếu tour khởi hành quá sát giờ, backend cấm giữ -> fallback tạo booking
        // thường để khách thanh toán ngay.
        try {
          const held = await bookingService.holdBooking(payload);
          if (active) {
            setDbBookingId(held.id);
            setHoldExpiredAt(held.holdExpiredAt ?? null);
          }
        } catch {
          const response = await bookingService.createBooking(payload);
          if (active) {
            setDbBookingId(response.id);
            setHoldExpiredAt(null);
          }
        }
      } catch (err: any) {
        console.error('Failed to create booking in DB:', err);
        if (active) {
          setErrorMessage(
            err.message ||
              'Không thể khởi tạo đặt tour trên hệ thống. Vui lòng thử lại sau.',
          );
        }
      } finally {
        if (active) {
          setIsCreatingBooking(false);
        }
      }
    };
    createDbBooking();
    return () => {
      active = false;
    };
    // Payload chỉ còn phụ thuộc lịch trình, số khách và các mục đã chọn —
    // giá không nằm trong đây nữa nên effect không chạy lại khi giá đổi.
  }, [selectedSchedule.id, guests, selectedRoom, selectedServices]);

  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  const createPaymentLink = useCallback(async () => {
    if (!dbBookingId) return;
    setIsLoadingPayment(true);
    setErrorMessage(null);
    try {
      setPayment(await bookingService.createPaymentLink(dbBookingId));
    } catch (err: any) {
      setPayment(null);
      setErrorMessage(
        err.message ||
          'Không tạo được mã thanh toán. Vui lòng thử lại sau ít phút.',
      );
    } finally {
      setIsLoadingPayment(false);
    }
  }, [dbBookingId]);

  // Giá đổi (áp/gỡ mã giảm giá) thì mã thanh toán cũ không còn đúng số tiền nữa.
  useEffect(() => {
    if (!dbBookingId || isPaid) return;
    createPaymentLink();
  }, [dbBookingId, payableTotal, isPaid, createPaymentLink]);

  /**
   * Hỏi server đã nhận tiền chưa. Server tự đối chiếu với PayOS —
   * phía này không khẳng định gì, chỉ đọc kết quả.
   */
  const checkPaymentStatus = useCallback(
    async (manual = false) => {
      if (!dbBookingId) return false;
      if (manual) setIsChecking(true);
      try {
        const status = await bookingService.getPaymentStatus(dbBookingId);
        if (status.paid) {
          setIsPaid(true);
          setTimeout(() => onConfirmRef.current(), 1500);
          return true;
        }
        if (manual) {
          setErrorMessage(
            'Chưa nhận được thanh toán. Nếu bạn vừa chuyển khoản, hệ thống thường ghi nhận sau vài giây.',
          );
        }
        return false;
      } catch {
        if (manual) {
          setErrorMessage('Không kiểm tra được trạng thái. Vui lòng thử lại.');
        }
        return false;
      } finally {
        if (manual) setIsChecking(false);
      }
    },
    [dbBookingId],
  );

  /**
   * Chỉ dùng khi demo: đánh dấu đơn đã trả tiền mà không qua PayOS. Server chỉ
   * còn chặn việc đụng vào đơn của người khác.
   */
  const simulatePayment = useCallback(async () => {
    if (!dbBookingId) return;
    setIsChecking(true);
    setErrorMessage(null);
    try {
      const status = await bookingService.simulatePayment(dbBookingId);
      if (status.paid) {
        setIsPaid(true);
        setTimeout(() => onConfirmRef.current(), 1500);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Giả lập thất bại — tài khoản này không có quyền giả lập thanh toán.',
      );
    } finally {
      setIsChecking(false);
    }
  }, [dbBookingId]);

  // Webhook PayOS là đường chính, vòng lặp này chỉ để màn hình tự cập nhật.
  useEffect(() => {
    if (!dbBookingId || !payment || isPaid || holdExpired) return;
    const timer = window.setInterval(() => {
      void checkPaymentStatus();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [dbBookingId, payment, isPaid, holdExpired, checkPaymentStatus]);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {t('booking.confirm.title', 'Xác nhận thông tin & Thanh toán')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            'booking.confirm.subtitle',
            'Vui lòng kiểm tra kỹ lộ trình và thanh toán để hoàn tất đặt chỗ.',
          )}
        </p>
      </div>

      {holdExpiredAt && !isPaid && (
        <HoldCountdown
          expiresAt={holdExpiredAt}
          onExpire={() => setHoldExpired(true)}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <SummaryPanel
          tour={tour}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedRoom={selectedRoom}
          selectedSchedule={selectedSchedule}
          guests={guests}
          tourPrice={tourPrice}
          roomPrice={roomPrice}
          servicePrice={servicePrice}
          totalPrice={totalPrice}
          selectedServices={selectedServices}
          bookingId={dbBookingId}
          quote={quote}
          onQuoteChange={setQuote}
        />

        <PaymentPanel
          isCreatingBooking={isCreatingBooking}
          isPaid={isPaid}
          isLoadingPayment={isLoadingPayment}
          payment={payment}
          errorMessage={errorMessage}
          isChecking={isChecking}
          displayCode={displayCode}
          totalPrice={payableTotal}
          onRetry={createPaymentLink}
          onCheckNow={() => void checkPaymentStatus(true)}
          onSimulate={() => void simulatePayment()}
        />
      </div>
    </div>
  );
}
