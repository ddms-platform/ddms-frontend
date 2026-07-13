import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, MapPin, MessageCircle } from 'lucide-react';
import { formatPrice, getLocalizedField } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { bookingService } from '@/services/bookingService';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';
import CheckInQr from './check-in-qr';

export type BookingStatus =
  | 'PENDING'
  | 'UPCOMING'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
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

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

function BookingStatusBadge({
  status,
  className = '',
}: BookingStatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          text: '#f59e0b',
          label: t('dashboard.status.PENDING', 'Chờ thanh toán'),
        };
      case 'UPCOMING':
        return {
          bg: '#e8f5e9',
          text: '#2e7d32',
          label: t('dashboard.status.UPCOMING', 'Sắp khởi hành'),
        };
      case 'CHECKED_IN':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          text: '#2563eb',
          label: t('dashboard.status.CHECKED_IN', 'Đã check-in'),
        };
      case 'COMPLETED':
        return {
          bg: '#eef2ff',
          text: '#4338ca',
          label: t('dashboard.status.COMPLETED', 'Đã hoàn thành'),
        };
      case 'CANCELLED':
        return {
          bg: 'rgba(255,255,255,0.1)',
          text: '#ecf0ff',
          label: t('dashboard.status.CANCELLED', 'Đã hủy'),
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`rounded-full px-2.5 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancelSuccess?: () => void;
}

export default function BookingCard({
  booking,
  onCancelSuccess,
}: BookingCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async () => {
    setIsStartingChat(true);
    try {
      const conv = await chatService.startConversation(booking.id);
      navigate(`/inbox?conversationId=${conv.id}`);
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      toast.error('Không thể bắt đầu trò chuyện với chủ tàu.');
    } finally {
      setIsStartingChat(false);
    }
  };

  // Parse departure date to check refund eligibility (>= 48 hours away)
  const departureDate = new Date(
    `${booking.date}T${booking.time.split(' - ')[0]}`,
  );
  const now = new Date();
  const timeDiff = departureDate.getTime() - now.getTime();
  const hoursToDeparture = timeDiff / (1000 * 60 * 60);
  const eligibleForRefund = hoursToDeparture >= 48;

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      const res = await bookingService.cancelBooking(booking.id);
      if (res.success) {
        toast.success(
          res.refunded
            ? t('dashboard.cancelModal.successRefunded', {
                price: formatPrice(booking.totalPrice),
              })
            : t('dashboard.cancelModal.successNoRefund'),
        );
        onCancelSuccess?.();
      }
    } catch (error: any) {
      console.error('Cancel booking failed:', error);
      toast.error(
        error.response?.data?.message || t('dashboard.cancelModal.error'),
      );
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  // Simple date format
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === 'vn' ? 'vi-VN' : 'en-US',
      {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border p-4 transition-all hover:shadow-md sm:flex-row sm:gap-6 sm:p-5"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ddms-bg-card)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-40 sm:aspect-square">
        <img
          src={booking.image}
          alt={getLocalizedField(
            { title_vn: booking.tourTitle_vn, title_en: booking.tourTitle_en },
            'title',
            lang,
          )}
          className="h-full w-full object-cover"
        />
        {/* Mobile Badges overlay */}
        <div className="absolute left-3 top-3 sm:hidden">
          <BookingStatusBadge status={booking.status} className="py-1" />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col sm:py-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('dashboard.bookingRef')}: #DDMS-{booking.id}
              </span>
              <BookingStatusBadge
                status={booking.status}
                className="hidden py-0.5 sm:inline-block"
              />
            </div>
            <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground">
              {getLocalizedField(
                {
                  title_vn: booking.tourTitle_vn,
                  title_en: booking.tourTitle_en,
                },
                'title',
                lang,
              )}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} />
              {getLocalizedField(
                {
                  location_vn: booking.location_vn,
                  location_en: booking.location_en,
                },
                'location',
                lang,
              )}
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <span className="block text-lg font-bold text-foreground">
              {formatPrice(booking.totalPrice)}
            </span>
            <span className="text-sm text-muted-foreground">
              {booking.guests} {t('dashboard.guests')}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm sm:mt-auto">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Calendar size={16} className="text-muted-foreground" />
            {formatDate(booking.date)}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            {booking.time}
          </div>
          <div className="flex items-center gap-1.5 font-medium sm:hidden text-foreground">
            <Users size={16} className="text-muted-foreground" />
            {booking.guests}
          </div>
        </div>

        {booking.canShowCheckInQr && (
          <CheckInQr bookingId={booking.id} bookingCode={booking.bookingCode} />
        )}
      </div>

      {/* Actions & Mobile Price */}
      <div className="mt-2 flex items-center justify-between border-t pt-4 sm:hidden border-border">
        <div>
          <span className="block text-lg font-bold text-foreground">
            {formatPrice(booking.totalPrice)}
          </span>
        </div>
        <div className="flex gap-2">
          {booking.status === 'PENDING' && (
            <Button variant="cyan" size="action" asChild>
              <Link to={`/tours/${booking.tourId}/booking`}>
                {t('dashboard.payNow', 'Thanh toán')}
              </Link>
            </Button>
          )}
          {booking.status === 'UPCOMING' && (
            <Button
              variant="outline"
              size="action"
              className="text-foreground border-foreground/30 hover:bg-foreground/5"
              onClick={() => setIsCancelModalOpen(true)}
            >
              {t('dashboard.cancelBooking')}
            </Button>
          )}
          {booking.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="action"
              className="text-foreground border-foreground/30 hover:bg-foreground/5"
            >
              {t('dashboard.writeReview')}
            </Button>
          )}
          {booking.status === 'CHECKED_IN' && (
            <Button
              variant="outline"
              size="action"
              className="text-foreground border-foreground/30 hover:bg-foreground/5"
              asChild
            >
              <Link to={`/tours/${booking.tourId}`}>
                {t('dashboard.viewDetails')}
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="action"
            className="text-foreground border-foreground/30 hover:bg-foreground/5"
            onClick={handleStartChat}
            disabled={isStartingChat}
            title={t('chat.chatWithOwner', 'Chat với chủ tàu')}
          >
            {isStartingChat ? '...' : <MessageCircle size={14} />}
          </Button>
        </div>
      </div>

      <div className="hidden shrink-0 flex-col justify-end sm:flex sm:min-w-30 gap-2">
        {booking.status === 'PENDING' && (
          <Button
            variant="cyan"
            size="action"
            className="w-full rounded-xl"
            asChild
          >
            <Link to={`/tours/${booking.tourId}/booking`}>
              {t('dashboard.payNow', 'Thanh toán')}
            </Link>
          </Button>
        )}
        {booking.status === 'UPCOMING' && (
          <Button
            variant="outline"
            size="action"
            className="w-full rounded-xl text-foreground border-foreground/30 hover:bg-foreground/5"
            onClick={() => setIsCancelModalOpen(true)}
          >
            {t('dashboard.cancelBooking')}
          </Button>
        )}
        {booking.status === 'COMPLETED' && (
          <Button variant="cyan" size="action" className="w-full rounded-xl">
            {t('dashboard.writeReview')}
          </Button>
        )}
        {booking.status === 'CHECKED_IN' && (
          <Button
            variant="outline"
            size="action"
            className="w-full rounded-xl text-foreground border-foreground/30 hover:bg-foreground/5 bg-ddms-bg-card"
            asChild
          >
            <Link to={`/tours/${booking.tourId}`}>
              {t('dashboard.viewDetails')}
            </Link>
          </Button>
        )}
        {(booking.status === 'CANCELLED' || !booking.status) && (
          <Button
            variant="outline"
            size="action"
            className="w-full rounded-xl text-foreground border-foreground/30 hover:bg-foreground/5 bg-ddms-bg-card"
            asChild
          >
            <Link to={`/tours/${booking.tourId}`}>
              {t('dashboard.viewDetails')}
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          size="action"
          className="w-full rounded-xl flex items-center justify-center gap-1.5 text-foreground border-foreground/30 hover:bg-foreground/5"
          onClick={handleStartChat}
          disabled={isStartingChat}
        >
          <MessageCircle size={14} className="text-ddms-secondary" />
          {isStartingChat
            ? t('chat.connecting', 'Đang kết nối...')
            : t('chat.chatWithOwner', 'Chat với chủ tàu')}
        </Button>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border p-6 shadow-2xl scale-in text-foreground"
            style={{
              backgroundColor: 'var(--ddms-bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <h3 className="text-xl font-bold mb-4 text-ddms-secondary">
              {t('dashboard.cancelModal.title')}
            </h3>
            <div className="text-sm leading-relaxed mb-6 text-muted-foreground">
              {eligibleForRefund ? (
                <p>
                  {t('dashboard.cancelModal.refundEligible', {
                    price: formatPrice(booking.totalPrice),
                  })}
                </p>
              ) : (
                <p>{t('dashboard.cancelModal.noRefund')}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="text-foreground border-foreground/30 hover:bg-foreground/5"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
              >
                {t('dashboard.cancelModal.closeBtn')}
              </Button>
              <Button
                variant="cyan"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className={
                  !eligibleForRefund
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-0'
                    : ''
                }
              >
                {isCancelling
                  ? t('dashboard.cancelModal.cancellingBtn')
                  : t('dashboard.cancelModal.confirmBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
