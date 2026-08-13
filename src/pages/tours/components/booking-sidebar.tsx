import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { wishlistService } from '@/services/wishlistService';

interface BookingSidebarProps {
  tourId: string;
  price: number;
  currency?: string;
  isClosed?: boolean;
  createdBy?: string;
  selectedClassId?: string;
  selectedServiceIds?: string[];
}

export default function BookingSidebar({
  tourId,
  price,
  isClosed,
  createdBy,
  selectedClassId,
  selectedServiceIds = [],
}: BookingSidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const normalizeId = (value?: string | null) => value?.trim().toLowerCase();
  const isOwner =
    !!normalizeId((user as any)?.id) &&
    normalizeId((user as any)?.id) === normalizeId(createdBy);

  const bookingParams = new URLSearchParams();
  if (selectedClassId) bookingParams.set('classId', selectedClassId);
  if (selectedServiceIds.length > 0) {
    bookingParams.set('services', selectedServiceIds.join(','));
  }
  const bookingQuery = bookingParams.toString();
  const bookingPath = `/tours/${tourId}/booking${bookingQuery ? `?${bookingQuery}` : ''}`;
  const bookingState = {
    bookingPrefill: {
      classId: selectedClassId || '',
      serviceIds: selectedServiceIds,
    },
  };

  useEffect(() => {
    if (user) {
      wishlistService
        .getWishlistedTourIds()
        .then((ids) => {
          setIsWishlisted(ids.includes(tourId));
        })
        .catch(console.error);
    } else {
      const timer = window.setTimeout(() => {
        setIsWishlisted(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [tourId, user]);

  const handleWishlistToggle = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('auth-required'));
      return;
    }

    setWishlistLoading(true);
    try {
      await wishlistService.toggleWishlist(tourId);
      setIsWishlisted((prev) => !prev);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error(error);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 border"
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
      ) : isOwner ? null : (
        <Button variant="cyan" size="action-lg" className="w-full" asChild>
          <Link to={bookingPath} state={bookingState}>
            {t('tour.booking.bookNow')}
          </Link>
        </Button>
      )}

      <Button
        variant="outline"
        size="action"
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className="mt-3 w-full gap-2 text-foreground border-foreground/30 hover:bg-foreground/5 cursor-pointer"
      >
        <Heart
          size={16}
          fill={isWishlisted ? '#ff385c' : 'none'}
          className={isWishlisted ? 'text-[#ff385c]' : 'text-foreground'}
        />
        {isWishlisted
          ? t('tour.booking.removeWishlist')
          : t('tour.booking.addWishlist')}
      </Button>

      {!isOwner && (
        <p className="mt-4 text-center text-xs text-foreground/70">
          {t('tour.booking.noChargeYet')}
        </p>
      )}
    </div>
  );
}
