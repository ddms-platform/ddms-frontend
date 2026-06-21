import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoomOption } from '../types';
import type { TourItemResponse } from '@/services/tourService';
import { bookingService } from '@/services/bookingService';
import SummaryPanel from './step-confirm/SummaryPanel';
import PaymentPanel from './step-confirm/PaymentPanel';

interface StepConfirmProps {
  tour: TourItemResponse;
  selectedDate: string;
  selectedTime: string;
  selectedRoom: RoomOption | null;
  guests: number;
  tourPrice: number;
  roomPrice: number;
  totalPrice: number;
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
  totalPrice,
  selectedSchedule,
  onConfirm,
}: StepConfirmProps) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'payos' | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [webhookReceived, setWebhookReceived] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [dbBookingId, setDbBookingId] = useState<string | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(true);

  const bookingCode = useMemo(() => {
    return 'DDMS' + Math.floor(100000 + Math.random() * 900000);
  }, []);

  const displayCode = dbBookingId
    ? dbBookingId.slice(0, 8).toUpperCase()
    : bookingCode;

  useEffect(() => {
    let active = true;
    const createDbBooking = async () => {
      try {
        setIsCreatingBooking(true);
        const payload = {
          scheduleId: selectedSchedule.id,
          numPeople: guests,
          basePrice: tour.price,
          cabinPrice: roomPrice,
          servicePrice: 0,
          discountAmount: 0,
          totalPrice: totalPrice,
          notes: '',
          cabins: selectedRoom
            ? [
                {
                  cabinId: selectedRoom.id,
                  quantity: 1,
                  unitPrice: selectedRoom.price,
                },
              ]
            : [],
        };
        const response = await bookingService.createBooking(payload);
        if (active) {
          setDbBookingId(response.id);
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
  }, [
    selectedSchedule.id,
    guests,
    tour.price,
    roomPrice,
    totalPrice,
    selectedRoom,
  ]);

  const handlePaymentSubmit = () => {
    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(async () => {
      if (webhookReceived) {
        try {
          if (dbBookingId) {
            await bookingService.confirmPayment(dbBookingId);
          }
          setIsPaid(true);
          setTimeout(() => {
            onConfirm();
          }, 1500);
        } catch (err: any) {
          setIsVerifying(false);
          setErrorMessage(
            err.message ||
              'Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại.',
          );
        }
      } else {
        setIsVerifying(false);
        setErrorMessage(
          `Không tìm thấy giao dịch chuyển khoản với nội dung '${
            paymentMethod === 'payos' ? 'PAYOS' : 'DATTOUR'
          } ${displayCode}'. Hệ thống đang chạy trên môi trường thử nghiệm. Mách nhỏ: Vui lòng click vào nút màu xanh "Giả lập cổng PayOS thanh toán thành công" (hoặc "Giả lập nhận tiền thành công" đối với VietQR) ở bên dưới để bỏ qua bước quét mã QR thực tế và hoàn tất đơn hàng nhanh chóng.`,
        );
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-lg font-semibold text-white">
          {t('booking.confirm.title', 'Xác nhận thông tin & Thanh toán')}
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          {t(
            'booking.confirm.subtitle',
            'Vui lòng kiểm tra kỹ lộ trình và thanh toán để hoàn tất đặt chỗ.',
          )}
        </p>
      </div>

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
          totalPrice={totalPrice}
        />

        <PaymentPanel
          isCreatingBooking={isCreatingBooking}
          isPaid={isPaid}
          isVerifying={isVerifying}
          paymentMethod={paymentMethod}
          webhookReceived={webhookReceived}
          errorMessage={errorMessage}
          displayCode={displayCode}
          totalPrice={totalPrice}
          onSelectMethod={setPaymentMethod}
          onClearError={() => setErrorMessage(null)}
          onMarkWebhookReceived={() => {
            setWebhookReceived(true);
            setErrorMessage(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      </div>
    </div>
  );
}
