import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ChevronRight, Heart } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import { formatPrice } from '@/lib/utils';
import {
  tourService,
  type TourSearchItemResponse,
} from '@/services/tourService';

import { useAuth } from '@/hooks/use-auth';
import { wishlistService } from '@/services/wishlistService';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedTours() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [tours, setTours] = useState<TourSearchItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await tourService.searchTours({
          pageSize: 4,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        setTours(res.items || []);
      } catch (error) {
        console.error('Failed to fetch featured tours:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (user) {
      wishlistService
        .getWishlistedTourIds()
        .then(setWishlist)
        .catch(console.error);
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (id: string) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('auth-required'));
      return;
    }
    // Optimistic UI update
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
    try {
      await wishlistService.toggleWishlist(id);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error(error);
      // Revert on error
      setWishlist((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} ${t('home.tours.hours', 'giờ')}`;
    return `${mins} ${t('home.tours.minutes', 'phút')}`;
  };

  return (
    <div className="relative w-full overflow-hidden bg-background py-16">
      {/* Decorative background glow blobs */}
      <div className="absolute -left-48 top-1/4 h-96 w-96 rounded-full bg-linear-to-tr from-cyan-400/15 to-blue-500/5 blur-3xl opacity-60 dark:opacity-20 pointer-events-none z-0" />
      <div className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-linear-to-br from-amber-400/10 to-rose-400/5 blur-3xl opacity-50 dark:opacity-10 pointer-events-none z-0" />

      <section id="tours" className="relative mx-auto max-w-7xl px-6 z-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2
              className="text-[28px] font-bold leading-[1.43] text-foreground"
              style={{ letterSpacing: '-0.44px' }}
            >
              {t('home.tours.title')}
            </h2>
            <p className="mt-2 text-sm text-foreground/80">
              {t('home.tours.subtitle')}
            </p>
          </div>
          <Link
            to={routeName.tours}
            className="hidden items-center gap-1 text-sm font-semibold transition-colors hover:underline sm:flex text-foreground"
          >
            {t('home.tours.viewAll')}
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-ddms-bg-card rounded-2xl border border-border p-4 space-y-4 shadow-sm"
              >
                <Skeleton className="aspect-16/11 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[#ecf0ff]">
            Không có tour nào nổi bật.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="group overflow-hidden rounded-2xl transition-all border hover:shadow-lg bg-ddms-bg-card"
                style={{
                  borderColor: 'var(--border)',
                }}
              >
                {/* Image */}
                <div className="relative aspect-16/11 overflow-hidden bg-[#1a2e4c]">
                  <img
                    src={
                      tour.imageUrl ||
                      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop'
                    }
                    alt={tour.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(tour.id);
                    }}
                    className="absolute right-3 top-3 rounded-full p-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: 'rgba(0,240,255,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Heart
                      size={18}
                      fill={wishlist.includes(tour.id) ? '#ff385c' : 'none'}
                      style={{
                        color: wishlist.includes(tour.id)
                          ? '#ff385c'
                          : '#ffffff',
                      }}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="line-clamp-1 text-base font-semibold text-foreground"
                      title={tour.name}
                    >
                      {tour.name}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      <Star
                        size={14}
                        fill="#ffc107"
                        style={{ color: '#ffc107' }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {tour.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-foreground/80">
                    <MapPin size={13} className="shrink-0" />
                    <span className="line-clamp-1">
                      {tour.location || 'N/A'}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    {formatDuration(tour.durationMinutes)} · {tour.totalReviews}{' '}
                    {t('home.tours.reviews')}
                  </p>
                  <p
                    className="mt-3 text-base font-semibold"
                    style={{ color: 'var(--ddms-secondary)' }}
                  >
                    {formatPrice(tour.price)}
                    <span className="text-sm font-normal text-foreground/70">
                      {' '}
                      / {t('home.tours.perPerson')}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
