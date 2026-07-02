import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface BookingSidebarProps {
  tourId: string;
  price: number;
  currency?: string;
  isClosed?: boolean;
  createdBy?: string;
}

export default function BookingSidebar({
  tourId,
  price,
  isClosed,
  createdBy,
}: BookingSidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isOwner =
    (user as any)?.id && createdBy && (user as any).id === createdBy;

  return (
    <div
      className="sticky top-24 rounded-2xl p-6 border"
      style={{
        backgroundColor: 'var(--ddms-bg-card)',
        borderColor: 'var(--border)',
        boxShadow:
          'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.05) 0px 4px 8px',
      }}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(price)}
        </span>
        <span className="text-sm text-foreground/80">
          / {t('tour.booking.perPerson')}
        </span>
      </div>

      <div className="my-5 h-px" style={{ backgroundColor: 'var(--border)' }} />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/80">
            {t('tour.booking.availability')}
          </span>
          {isClosed ? (
            <span className="font-medium text-red-500">Tạm đóng</span>
          ) : (
            <span className="font-medium text-green-500">
              {t('tour.booking.available')}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/80">
            {t('tour.booking.cancellation')}
          </span>
          <span className="font-medium text-foreground">
            {t('tour.booking.freeCancellation')}
          </span>
        </div>
      </div>

      <div className="my-5 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {isClosed ? (
        <Button
          variant="secondary"
          size="action-lg"
          className="w-full"
          disabled
        >
          Tạm đóng
        </Button>
      ) : isOwner ? (
        <Button
          variant="secondary"
          size="action-lg"
          className="w-full bg-gray-500 text-white cursor-not-allowed hover:bg-gray-500"
          disabled
        >
          Tour của bạn
        </Button>
      ) : (
        <Button variant="cyan" size="action-lg" className="w-full" asChild>
          <Link to={`/tours/${tourId}/booking`}>
            {t('tour.booking.bookNow')}
          </Link>
        </Button>
      )}

      <Button
        variant="outline"
        size="action"
        className="mt-3 w-full gap-2 text-foreground border-foreground/30 hover:bg-foreground/5"
      >
        <Heart size={16} />
        {t('tour.booking.addWishlist')}
      </Button>

      <p className="mt-4 text-center text-xs text-foreground/70">
        {t('tour.booking.noChargeYet')}
      </p>
    </div>
  );
}
