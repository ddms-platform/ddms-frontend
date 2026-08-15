import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import { formatPrice } from '@/lib/utils';
import {
  tourService,
  type TourSearchItemResponse,
} from '@/services/tourService';

import { useAuth } from '@/hooks/use-auth';
import { wishlistService } from '@/services/wishlistService';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export default function FeaturedTours() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [tours, setTours] = useState<TourSearchItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await tourService.searchTours({
          pageSize: 8,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        setTours(res.items || []);
      } catch (error) {
        // Không có tour thì để trống. Trước đây chỗ này trộn 8 tour giả vào,
        // nên trang chủ luôn hiện tour không có thật kể cả khi API chạy tốt.
        console.error('Failed to fetch featured tours:', error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [i18n.language]);

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

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const isMobile = window.innerWidth < 640;
      const cardWidth = isMobile ? 300 : 370;
      const gap = 24;
      const itemSpan = cardWidth + gap;
      const idx = Math.round(scrollLeft / itemSpan);
      setStartIndex((prev) => (prev !== idx ? idx : prev));
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const isMobile = window.innerWidth < 640;
      const cardWidth = isMobile ? 300 : 370;
      const gap = 24;
      const itemSpan = cardWidth + gap;

      const newIndex =
        direction === 'left'
          ? Math.max(0, startIndex - 3)
          : Math.min(tours.length - 3, startIndex + 3);

      setStartIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        left: newIndex * itemSpan,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-transparent py-20">
      {/* Decorative background glow blobs */}
      <div className="absolute -left-48 top-1/4 h-96 w-96 rounded-full bg-linear-to-tr from-cyan-400/15 to-blue-500/5 blur-3xl opacity-60 dark:opacity-20 pointer-events-none z-0" />
      <div className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-linear-to-br from-amber-400/10 to-rose-400/5 blur-3xl opacity-50 dark:opacity-10 pointer-events-none z-0" />

      <section id="tours" className="relative mx-auto max-w-7xl px-6 z-10">
        {/* Section Header with Carousel Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-[32px] font-bold leading-tight text-foreground tracking-tight">
              {t('home.tours.topDestinations')}
            </h2>
            <Link
              to={routeName.tours}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary mt-2 transition-all"
            >
              <span>{t('home.tours.learnMore')}</span>
              <svg
                className="w-6.5 h-4 transition-transform duration-300 group-hover:translate-x-2 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* Carousel Control Arrows */}
          {!loading && tours.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border text-foreground hover:bg-ddms-bg-card hover:border-foreground transition-all active:scale-95 bg-ddms-bg-card/70 backdrop-blur-xs"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border text-foreground hover:bg-ddms-bg-card hover:border-foreground transition-all active:scale-95 bg-ddms-bg-card/70 backdrop-blur-xs"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-none w-75 h-75 sm:w-92.5 sm:h-92.5 bg-ddms-bg-card rounded-[24px] relative overflow-hidden"
              >
                <Skeleton className="absolute inset-0 w-full h-full rounded-none opacity-40" />
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 z-10">
                  <Skeleton className="h-4 w-1/3 opacity-50" />
                  <Skeleton className="h-7 w-3/4 opacity-50" />
                  <Skeleton className="h-5 w-1/2 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-center">
            <MapPin size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('home.tours.noTours')}
            </p>
          </div>
        ) : (
          /* Horizontal Carousel Container */
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {tours.map((tour, idx) => {
              const isVisible = idx >= startIndex && idx < startIndex + 3;
              return (
                <Link
                  key={tour.id}
                  to={`/tours/${tour.id}`}
                  className={`group flex-none w-75 snap-start overflow-hidden rounded-[20px] bg-ddms-bg-card
                    shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px,rgba(0,0,0,0.1)_0_4px_8px]
                    transition-all duration-250 hover:-translate-y-1.25 hover:shadow-[rgba(0,0,0,0.12)_0_8px_24px]
                    dark:shadow-[rgba(0,0,0,.4)_0_0_0_1px,rgba(0,0,0,.5)_0_4px_12px] ${
                      isVisible ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                >
                  {/* Ảnh bìa */}
                  <div className="relative h-52.5 overflow-hidden">
                    <img
                      src={
                        tour.imageUrl ||
                        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop'
                      }
                      alt={tour.name}
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    <span className="absolute top-3.5 left-3.5 flex items-center gap-1 rounded-[14px] bg-white/92 px-3 py-1.5 text-xs font-bold text-[#222]">
                      <MapPin size={11} className="shrink-0" />
                      {tour.location || 'Đà Nẵng'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(tour.id);
                      }}
                      aria-label="Yêu thích"
                      className="absolute top-3.5 right-3.5 grid size-8.5 place-items-center rounded-full bg-white/90 transition-transform group-hover:scale-110"
                    >
                      <Heart
                        size={16}
                        fill={wishlist.includes(tour.id) ? '#ff385c' : 'none'}
                        className={
                          wishlist.includes(tour.id)
                            ? 'text-ddms-primary'
                            : 'text-[#222]'
                        }
                      />
                    </button>
                  </div>

                  {/* Nội dung */}
                  <div className="px-5 pt-4.5 pb-5">
                    <div className="flex items-baseline justify-between gap-2.5">
                      <h3
                        className="line-clamp-2 text-base font-semibold tracking-[-0.18px] text-foreground"
                        title={tour.name}
                      >
                        {tour.name}
                      </h3>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
                        <Star
                          size={13}
                          fill="#ffc107"
                          className="text-[#ffc107]"
                        />
                        {tour.avgRating.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {tour.totalReviews} {t('home.tours.reviews')}
                    </p>

                    <p className="mt-2.5 text-[15px] text-foreground">
                      <b className="font-bold">{formatPrice(tour.price)}</b>
                      <span className="text-muted-foreground">
                        {' '}
                        / {t('home.tours.perPerson')}
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
