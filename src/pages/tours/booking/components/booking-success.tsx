import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import { formatDate } from './step-date-time';
import { useTripCart } from '@/contexts/TripCartContext';

interface BookingSuccessProps {
  tourName: string;
  selectedDate: string;
  selectedTime: string;
  guests: number;
  totalPrice: number;
}

export default function BookingSuccess({
  tourName,
  selectedDate,
  selectedTime,
  guests,
  totalPrice,
}: BookingSuccessProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, currentIndex, hasNext, advance, clear } = useTripCart();

  const handleNextInCombo = () => {
    const next = advance();
    if (next) {
      navigate(`/tours/${next.tourId}/booking`);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      {items.length > 1 && (
        <div className="mb-6 rounded-2xl border border-purple-500/40 bg-linear-to-br from-purple-500/10 to-pink-500/10 p-4 text-left">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            🛒 Combo Trip Concierge
          </p>
          <p className="text-sm text-foreground">
            Tour {currentIndex + 1}/{items.length} đã đặt xong.
            {hasNext
              ? ` Còn ${items.length - currentIndex - 1} tour trong combo.`
              : ' 🎉 Bạn đã hoàn thành combo!'}
          </p>
          {hasNext ? (
            <Button
              variant="cyan"
              size="action"
              className="mt-3 w-full"
              onClick={handleNextInCombo}
            >
              Tiếp tục đặt tour tiếp theo{' '}
              <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="action"
              className="mt-3 w-full"
              onClick={() => clear()}
            >
              Đóng combo
            </Button>
          )}
        </div>
      )}
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, #34A853, #2d9348)' }}
      >
        <CheckCircle2 size={40} color="#ffffff" />
      </div>
      <h1
        className="text-[28px] font-bold text-foreground"
        style={{ letterSpacing: '-0.44px' }}
      >
        {t('booking.success.title')}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t('booking.success.description')}
      </p>

      <div className="mt-8 rounded-2xl p-6 text-left border bg-ddms-bg-card border-border">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('booking.summary.tour')}
            </span>
            <span className="font-medium text-foreground">{tourName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('booking.summary.date')}
            </span>
            <span className="font-medium text-foreground">
              {formatDate(selectedDate)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('booking.summary.time')}
            </span>
            <span className="font-medium text-foreground">{selectedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('booking.summary.guests')}
            </span>
            <span className="font-medium text-foreground">{guests}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">
              {t('booking.summary.total')}
            </span>
            <span className="font-bold text-ddms-secondary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="cyan" size="action-lg" asChild>
          <Link to={routeName.myTours}>
            {t('booking.success.viewBookings')}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="action-lg"
          className="text-foreground border-foreground/30 hover:bg-foreground/5"
          asChild
        >
          <Link to={routeName.home}>{t('booking.success.backHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
