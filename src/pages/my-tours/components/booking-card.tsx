import { useTranslation } from 'react-i18next';
import { Calendar, Users, MapPin } from 'lucide-react';
import { formatPrice, getLocalizedField } from '@/lib/utils';
import { Link } from 'react-router-dom';

export type BookingStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  tourId: number;
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
  createdAt: string;
}

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Status Badge Helper
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'UPCOMING':
        return { bg: '#e8f5e9', text: '#2e7d32', label: t('dashboard.status.UPCOMING') };
      case 'COMPLETED':
        return { bg: '#eef2ff', text: '#4338ca', label: t('dashboard.status.COMPLETED') };
      case 'CANCELLED':
        return { bg: '#f2f2f2', text: '#6a6a6a', label: t('dashboard.status.CANCELLED') };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  // Simple date format
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'vn' ? 'vi-VN' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border p-4 transition-all hover:shadow-md sm:flex-row sm:gap-6 sm:p-5"
      style={{ borderColor: '#e0e0e0', backgroundColor: '#ffffff' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-40 sm:aspect-square">
        <img
          src={booking.image}
          alt={getLocalizedField(
            { title_vn: booking.tourTitle_vn, title_en: booking.tourTitle_en },
            'title',
            lang
          )}
          className="h-full w-full object-cover"
        />
        {/* Mobile Badges overlay */}
        <div className="absolute left-3 top-3 sm:hidden">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col sm:py-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: '#6a6a6a' }}
              >
                {t('dashboard.bookingRef')}: #DDMS-{booking.id}
              </span>
              <span
                className="hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-block"
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}
              >
                {statusConfig.label}
              </span>
            </div>
            <h3
              className="text-lg font-bold leading-tight line-clamp-2"
              style={{ color: '#222222' }}
            >
              {getLocalizedField(
                { title_vn: booking.tourTitle_vn, title_en: booking.tourTitle_en },
                'title',
                lang
              )}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
              <MapPin size={14} />
              {getLocalizedField(
                { location_vn: booking.location_vn, location_en: booking.location_en },
                'location',
                lang
              )}
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <span className="block text-lg font-bold" style={{ color: '#222222' }}>
              {formatPrice(booking.totalPrice)}
            </span>
            <span className="text-sm" style={{ color: '#6a6a6a' }}>
              {booking.guests} {t('dashboard.guests')}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm sm:mt-auto">
          <div className="flex items-center gap-1.5 font-medium" style={{ color: '#222222' }}>
            <Calendar size={16} style={{ color: '#6a6a6a' }} />
            {formatDate(booking.date)}
          </div>
          <div className="flex items-center gap-1.5 font-medium" style={{ color: '#222222' }}>
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#6a6a6a' }} />
            {booking.time}
          </div>
          <div
            className="flex items-center gap-1.5 font-medium sm:hidden"
            style={{ color: '#222222' }}
          >
            <Users size={16} style={{ color: '#6a6a6a' }} />
            {booking.guests}
          </div>
        </div>
      </div>

      {/* Actions & Mobile Price */}
      <div
        className="mt-2 flex items-center justify-between border-t pt-4 sm:hidden"
        style={{ borderColor: '#f2f2f2' }}
      >
        <div>
          <span className="block text-lg font-bold" style={{ color: '#222222' }}>
            {formatPrice(booking.totalPrice)}
          </span>
        </div>
        <div className="flex gap-2">
          {booking.status === 'UPCOMING' && (
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95"
              style={{ color: '#222222', border: '1px solid #c1c1c1' }}
            >
              {t('dashboard.cancelBooking')}
            </button>
          )}
          {booking.status === 'COMPLETED' && (
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95"
              style={{ color: '#222222', border: '1px solid #c1c1c1' }}
            >
              {t('dashboard.writeReview')}
            </button>
          )}
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden shrink-0 flex-col justify-end sm:flex sm:min-w-30">
        {booking.status === 'UPCOMING' && (
          <button
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98]"
            style={{ color: '#222222', border: '1px solid #c1c1c1', backgroundColor: '#ffffff' }}
          >
            {t('dashboard.cancelBooking')}
          </button>
        )}
        {booking.status === 'COMPLETED' && (
          <button
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98]"
            style={{ color: '#ffffff', backgroundColor: '#222222' }}
          >
            {t('dashboard.writeReview')}
          </button>
        )}
        {(booking.status === 'CANCELLED' || !booking.status) && (
          <Link
            to={`/tours/${booking.tourId}`}
            className="block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all hover:bg-gray-50 active:scale-[0.98]"
            style={{ color: '#222222', backgroundColor: '#f7f7f7' }}
          >
            {t('dashboard.viewDetails')}
          </Link>
        )}
      </div>
    </div>
  );
}
