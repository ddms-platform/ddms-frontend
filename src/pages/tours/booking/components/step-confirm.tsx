import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ship,
  CreditCard,
  QrCode,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RoomOption } from '../types';
import type { TourItemResponse } from '@/services/tourService';
import { bookingService } from '@/services/bookingService';

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

  // Generate short booking code for fallback/reference before loading DB booking ID
  const bookingCode = useMemo(() => {
    return 'DDMS' + Math.floor(100000 + Math.random() * 900000);
  }, []);

  const displayCode = dbBookingId
    ? dbBookingId.slice(0, 8).toUpperCase()
    : bookingCode;

  // Save booking to Database on mount
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

    // Simulate payment verification delay
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

  // Format date helper
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header */}
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

      {/* 2. Main details grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Side: Summary details */}
        <div className="space-y-4">
          <div
            className="flex items-center gap-3.5 rounded-xl p-4 border border-[rgba(255,255,255,0.06)]"
            style={{ backgroundColor: '#0d1b36' }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #00F0FF, #00b4c0)',
              }}
            >
              <Ship size={20} className="text-[#0A192F]" />
            </div>
            <div>
              <p className="font-bold text-white leading-tight">{tour.name}</p>
              <p className="text-xs text-[#00F0FF] mt-0.5">
                Thời lượng: {Math.floor(tour.durationMinutes / 60)} giờ{' '}
                {tour.durationMinutes % 60 > 0
                  ? `${tour.durationMinutes % 60} phút`
                  : ''}
              </p>
            </div>
          </div>

          <div
            className="rounded-xl border p-4 space-y-3"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              backgroundColor: '#0d1b36',
            }}
          >
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Ngày khởi hành</span>
              <span className="font-semibold text-white">
                {formatDateString(selectedDate)}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Giờ xuất phát</span>
              <span className="font-semibold text-white">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Số lượng khách</span>
              <span className="font-semibold text-white">
                {guests} {t('booking.guests.people', 'người')}
              </span>
            </div>
            {selectedSchedule?.boatName && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Du thuyền vận hành</span>
                <span className="font-semibold text-white">
                  {selectedSchedule.boatName}
                </span>
              </div>
            )}
            {selectedRoom && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Phòng nghỉ / Hạng ghế</span>
                <span className="font-semibold text-[#00F0FF]">
                  {selectedRoom.name}
                </span>
              </div>
            )}

            <div className="h-px bg-white/6 my-2" />

            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">
                Vé tour ({formatPrice(tour.price)} × {guests})
              </span>
              <span className="font-semibold text-white">
                {formatPrice(tourPrice)}
              </span>
            </div>
            {selectedRoom && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Phụ phí phòng/ghế</span>
                <span className="font-semibold text-white">
                  {formatPrice(roomPrice)}
                </span>
              </div>
            )}

            <div className="h-px bg-white/6 my-2" />

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-white">Tổng tiền thanh toán</span>
              <span className="text-xl font-black text-[#00F0FF]">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment integration panel */}
        <div
          className="rounded-xl border p-5 flex flex-col justify-center min-h-87.5 transition-all"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            backgroundColor: '#0d1b36',
          }}
        >
          {isCreatingBooking ? (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
              <Loader2 className="h-10 w-10 animate-spin text-[#00F0FF]" />
              <h3 className="text-sm font-bold text-white">
                Đang khởi tạo giao dịch đặt tour...
              </h3>
              <p className="text-xs text-gray-400">
                Vui lòng chờ trong giây lát.
              </p>
            </div>
          ) : isPaid ? (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
              <CheckCircle2
                size={56}
                className="text-[#10B981] animate-bounce"
              />
              <h3 className="text-lg font-bold text-white">
                Thanh toán thành công!
              </h3>
              <p className="text-xs text-gray-400">
                Đang hoàn tất lưu thông tin đặt chỗ...
              </p>
            </div>
          ) : isVerifying ? (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-[#00F0FF]" />
              <h3 className="text-sm font-bold text-white">
                Đang kiểm tra giao dịch...
              </h3>
              <p className="text-xs text-gray-400">
                Đang truy vấn trạng thái thanh toán từ hệ thống đối soát...
              </p>
            </div>
          ) : paymentMethod === null ? (
            /* Option Selector */
            <div className="space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Chọn phương thức thanh toán
              </p>
              <div className="grid gap-3 pt-2">
                {/* VietQR button */}
                <button
                  onClick={() => {
                    setPaymentMethod('vietqr');
                    setWebhookReceived(false);
                    setErrorMessage(null);
                  }}
                  className="group flex flex-col items-center justify-center rounded-xl border p-4 transition-all hover:scale-[1.02] hover:border-[#00F0FF]/40 active:scale-95"
                  style={{
                    backgroundColor: '#112240',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <QrCode
                    size={32}
                    className="text-[#00F0FF] transition-transform group-hover:scale-110"
                  />
                  <span className="mt-2 text-sm font-bold text-white">
                    Cổng VietQR (Chuyển khoản nhanh)
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    Hỗ trợ tất cả ứng dụng ngân hàng Việt Nam
                  </span>
                </button>

                {/* PayOS button */}
                <button
                  onClick={() => {
                    setPaymentMethod('payos');
                    setWebhookReceived(false);
                    setErrorMessage(null);
                  }}
                  className="group flex flex-col items-center justify-center rounded-xl border p-4 transition-all hover:scale-[1.02] hover:border-[#00F0FF]/40 active:scale-95"
                  style={{
                    backgroundColor: '#112240',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <CreditCard
                    size={32}
                    className="text-[#38bdf8] transition-transform group-hover:scale-110"
                  />
                  <span className="mt-2 text-sm font-bold text-white">
                    Ví PayOS (Mã QR & Link thanh toán)
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    Thanh toán tự động siêu tốc qua PayOS
                  </span>
                </button>
              </div>
            </div>
          ) : paymentMethod === 'vietqr' ? (
            /* VietQR Payment Dialog */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-white/6">
                <button
                  onClick={() => {
                    setPaymentMethod(null);
                    setErrorMessage(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Thanh toán VietQR
                </span>
              </div>

              {/* QR Image */}
              <div className="flex justify-center bg-white p-3 rounded-xl max-w-45 mx-auto shadow-md">
                <img
                  src={`https://img.vietqr.io/image/mbbank-0935566373-compact.png?amount=${totalPrice}&addInfo=DATTOUR%20${displayCode}&accountName=DDMS%20PORTAL`}
                  alt="VietQR Code"
                  className="w-full h-auto"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2 text-xs text-gray-300 bg-slate-900/40 p-3 rounded-xl border border-white/4">
                <div className="flex justify-between">
                  <span>Ngân hàng:</span>
                  <span className="font-semibold text-white">
                    MB Bank (Ngân hàng Quân Đội)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số tài khoản:</span>
                  <span className="font-semibold text-white font-mono">
                    0935566373
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chủ tài khoản:</span>
                  <span className="font-semibold text-white">DDMS PORTAL</span>
                </div>
                <div className="flex justify-between">
                  <span>Nội dung CK:</span>
                  <span className="font-bold text-[#00F0FF]">{`DATTOUR ${displayCode}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-bold text-[#10B981]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Webhook Simulation Trigger */}
              <div className="pt-2 border-t border-white/6 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Giả lập ngân hàng xác nhận:</span>
                  <span
                    className={
                      webhookReceived
                        ? 'text-emerald-400 font-bold'
                        : 'text-amber-400 font-bold'
                    }
                  >
                    {webhookReceived
                      ? 'Đã chuyển tiền (Paid)'
                      : 'Chưa thanh toán (Pending)'}
                  </span>
                </div>
                {!webhookReceived && (
                  <button
                    onClick={() => {
                      setWebhookReceived(true);
                      setErrorMessage(null);
                      alert(
                        `[Giả lập Webhook] Đã nhận được thông báo chuyển tiền thành công số tiền ${formatPrice(totalPrice)} cho đơn hàng ${displayCode}! Bây giờ bạn có thể nhấn "Đã chuyển khoản".`,
                      );
                    }}
                    className="w-full text-center py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all active:scale-95 cursor-pointer bg-[#10b981]/10 border-[#10b981]/30 text-[#10B981]"
                  >
                    ⚡ Giả lập nhận tiền thành công (Developer Test)
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setPaymentMethod(null);
                    setErrorMessage(null);
                  }}
                  variant="dark-outline"
                  size="action"
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  variant="cyan"
                  size="action"
                  className="flex-1 font-bold text-xs"
                >
                  Đã chuyển khoản
                </Button>
              </div>
            </div>
          ) : (
            /* PayOS Payment Dialog */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-white/6">
                <button
                  onClick={() => {
                    setPaymentMethod(null);
                    setErrorMessage(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Cổng PayOS
                </span>
              </div>

              {/* QR Image and simulation details */}
              <div className="flex flex-col items-center text-center py-2">
                <div className="flex justify-center bg-white p-3 rounded-xl max-w-45 mx-auto shadow-md">
                  <img
                    src={`https://img.vietqr.io/image/mbbank-0935566373-qr_only.png?amount=${totalPrice}&addInfo=PAYOS%20${displayCode}&accountName=PAYOS%20DDMS`}
                    alt="PayOS QR Code"
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                  Quét mã QR PayOS để thanh toán tự động
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1 text-[11px] text-center text-gray-300">
                <p>
                  Số tiền cần thanh toán:{' '}
                  <strong className="text-[#00F0FF]">
                    {formatPrice(totalPrice)}
                  </strong>
                </p>
                <p>
                  Mã đơn hàng PayOS:{' '}
                  <strong className="text-white font-mono">
                    #{displayCode}
                  </strong>
                </p>
              </div>

              {/* Webhook Simulation Trigger */}
              <div className="pt-2 border-t border-white/6 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Trạng thái giao dịch PayOS:</span>
                  <span
                    className={
                      webhookReceived
                        ? 'text-emerald-400 font-bold'
                        : 'text-amber-400 font-bold'
                    }
                  >
                    {webhookReceived
                      ? 'Thành công (Paid)'
                      : 'Chờ thanh toán (Pending)'}
                  </span>
                </div>
                {!webhookReceived && (
                  <button
                    onClick={() => {
                      setWebhookReceived(true);
                      setErrorMessage(null);
                      alert(
                        `[Giả lập Webhook] PayOS thông báo: Đơn hàng #${displayCode} đã thanh toán thành công số tiền ${formatPrice(totalPrice)}! Bây giờ bạn có thể nhấn "Tôi đã thanh toán".`,
                      );
                    }}
                    className="w-full text-center py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all active:scale-95 cursor-pointer bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8]"
                  >
                    ⚡ Giả lập cổng PayOS thanh toán thành công
                  </button>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {/* Checkout Link Simulation Button */}
                <a
                  href={`https://pay.payos.vn/web/checkout-simulated-${displayCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    setWebhookReceived(true);
                    setErrorMessage(null);
                    alert(
                      `Đang chuyển hướng đến cổng thanh toán PayOS để thanh toán đơn hàng ${displayCode}. Bạn đã thanh toán thành công trên cổng PayOS! Nhấn OK để quay lại trang đối soát.`,
                    );
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-xs font-bold text-[#0A192F] transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #38bdf8, #00f0ff)',
                  }}
                >
                  Mở link thanh toán PayOS
                </a>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setPaymentMethod(null);
                      setErrorMessage(null);
                    }}
                    variant="dark-outline"
                    size="action"
                    className="flex-1"
                  >
                    Quay lại
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    variant="cyan"
                    size="action"
                    className="flex-1 font-bold text-xs"
                  >
                    Tôi đã thanh toán
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
