import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface BookingSidebarProps {
  tourId: number;
  price: number;
  currency?: string;
}

export default function BookingSidebar({ tourId, price }: BookingSidebarProps) {
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
          <span style={{ color: '#ecf0ff' }}>{t('tour.booking.availability')}</span>
          <span className="font-medium" style={{ color: '#34A853' }}>
            {t('tour.booking.available')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: '#ecf0ff' }}>{t('tour.booking.cancellation')}</span>
          <span className="font-medium" style={{ color: '#ffffff' }}>
            {t('tour.booking.freeCancellation')}
          </span>
        </div>
      </div>

      <div className="my-5 h-px" style={{ backgroundColor: '#112240' }} />

      <Link
        to={`/tours/${tourId}/booking`}
        className="block w-full rounded-lg py-3.5 text-center text-base font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: '#00F0FF' }}
      >
        {t('tour.booking.bookNow')}
      </Link>

      <button
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
        style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
      >
        <Heart size={16} />
        {t('tour.booking.addWishlist')}
      </button>

      <p className="mt-4 text-center text-xs" style={{ color: '#ecf0ff' }}>
        {t('tour.booking.noChargeYet')}
      </p>
    </div>
  );
}
