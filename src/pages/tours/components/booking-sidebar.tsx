import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BookingSidebarProps {
  tourId: string;
  price: number;
  currency?: string;
  isClosed?: boolean;
}

export default function BookingSidebar({
  tourId,
  price,
  isClosed,
}: BookingSidebarProps) {
  const { t } = useTranslation();

  return (
    <div
      className="sticky top-24 rounded-2xl p-6"
      style={{
        backgroundColor: '#112240',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>
          {formatPrice(price)}
        </span>
        <span className="text-sm" style={{ color: '#ecf0ff' }}>
          / {t('tour.booking.perPerson')}
        </span>
      </div>

      <div className="my-5 h-px" style={{ backgroundColor: '#112240' }} />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: '#ecf0ff' }}>
            {t('tour.booking.availability')}
          </span>
          {isClosed ? (
            <span className="font-medium text-red-500">Tạm đóng</span>
          ) : (
            <span className="font-medium" style={{ color: '#34A853' }}>
              {t('tour.booking.available')}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: '#ecf0ff' }}>
            {t('tour.booking.cancellation')}
          </span>
          <span className="font-medium" style={{ color: '#ffffff' }}>
            {t('tour.booking.freeCancellation')}
          </span>
        </div>
      </div>

      <div className="my-5 h-px" style={{ backgroundColor: '#112240' }} />

      {isClosed ? (
        <Button
          variant="secondary"
          size="action-lg"
          className="w-full"
          disabled
        >
          Tạm đóng
        </Button>
      ) : (
        <Button variant="cyan" size="action-lg" className="w-full" asChild>
          <Link to={`/tours/${tourId}/booking`}>
            {t('tour.booking.bookNow')}
          </Link>
        </Button>
      )}

      <Button
        variant="dark-outline"
        size="action"
        className="mt-3 w-full gap-2"
      >
        <Heart size={16} />
        {t('tour.booking.addWishlist')}
      </Button>

      <p className="mt-4 text-center text-xs" style={{ color: '#ecf0ff' }}>
        {t('tour.booking.noChargeYet')}
      </p>
    </div>
  );
}
