import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { MOCK_TOUR } from '../mock-data';
import { formatDate } from './step-date-time';

interface BookingSuccessProps {
  selectedDate: string;
  selectedTime: string;
  guests: number;
  totalPrice: number;
}

export default function BookingSuccess({
  selectedDate,
  selectedTime,
  guests,
  totalPrice,
}: BookingSuccessProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, #34A853, #2d9348)' }}
      >
        <CheckCircle2 size={40} color="#ffffff" />
      </div>
      <h1 className="text-[28px] font-bold" style={{ color: '#ffffff', letterSpacing: '-0.44px' }}>
        {t('booking.success.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
        {t('booking.success.description')}
      </p>

      <div className="mt-8 rounded-2xl p-6 text-left" style={{ backgroundColor: '#112240' }}>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>{t('booking.summary.tour')}</span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {MOCK_TOUR.title}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>{t('booking.summary.date')}</span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {formatDate(selectedDate)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>{t('booking.summary.time')}</span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {selectedTime}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>{t('booking.summary.guests')}</span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {guests}
            </span>
          </div>
          <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div className="flex justify-between">
            <span className="font-semibold" style={{ color: '#ffffff' }}>
              {t('booking.summary.total')}
            </span>
            <span className="font-bold" style={{ color: '#00F0FF' }}>
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg py-3 text-center text-sm font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#112240' }}
        >
          {t('booking.success.viewBookings')}
        </Link>
        <Link
          to="/"
          className="rounded-lg border py-3 text-center text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          {t('booking.success.backHome')}
        </Link>
      </div>
    </div>
  );
}
