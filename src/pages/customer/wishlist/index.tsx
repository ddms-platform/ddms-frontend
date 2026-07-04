import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  MapPin,
  Star,
  ArrowLeft,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { wishlistService } from '@/services/wishlistService';
import type { TourSearchItemResponse } from '@/services/tourService';
import { formatPrice } from '@/lib/utils';
import { routeName } from '@/constants/route-name';
import { Skeleton } from '@/components/ui/skeleton';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating';

export default function WishlistPage() {
  const { t } = useTranslation();
  const [tours, setTours] = useState<TourSearchItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getWishlists();
      setTours(res.items);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeWishlist = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setTours((prev) => prev.filter((t) => t.id !== id));
      await wishlistService.toggleWishlist(id);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
      fetchWishlist();
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        t(
          'wishlist.clearAllConfirm',
          'Bạn có chắc chắn muốn xóa toàn bộ danh sách yêu thích?',
        ),
      )
    ) {
      try {
        const idsToRemove = tours.map((t) => t.id);
        setTours([]);
        for (const id of idsToRemove) {
          await wishlistService.toggleWishlist(id);
        }
        window.dispatchEvent(new Event('wishlist-updated'));
      } catch (error) {
        console.error('Failed to clear wishlist', error);
        fetchWishlist();
      }
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} ${t('home.tours.hours', 'giờ')}`;
    return `${mins} ${t('home.tours.minutes', 'phút')}`;
  };

  const getSortedTours = () => {
    const toursCopy = [...tours];
    if (sortBy === 'price-asc') {
      return toursCopy.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return toursCopy.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return toursCopy.sort((a, b) => b.avgRating - a.avgRating);
    }
    return toursCopy;
  };

  const sortedTours = getSortedTours();

  return (
    <div className="min-h-screen bg-ddms-bg-main pb-24">
      {/* Decorative top background blur */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-linear-to-b from-ddms-secondary/5 via-transparent to-transparent pointer-events-none" />

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to={routeName.home}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-ddms-bg-card border border-border/60 text-foreground transition-all hover:bg-foreground/5 hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {t('wishlist.title', 'Tour yêu thích của bạn')}
                </h1>
                {!loading && tours.length > 0 && (
                  <span className="rounded-full bg-ddms-secondary/15 px-3 py-1 text-sm font-semibold text-ddms-secondary">
                    {tours.length}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-muted-foreground text-sm">
                {t(
                  'wishlist.subtitle',
                  'Quản lý các tour du lịch mà bạn đã lưu lại.',
                )}
              </p>
            </div>
          </div>

          {/* Action Tools & Filters */}
          {!loading && tours.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-ddms-bg-card border border-border px-4 py-2 text-sm text-foreground shadow-sm">
                <SlidersHorizontal
                  size={14}
                  className="text-muted-foreground"
                />
                <span className="font-medium">
                  {t('wishlist.sortBy', 'Sắp xếp')}:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent font-semibold text-ddms-secondary focus:outline-none cursor-pointer pr-1"
                >
                  <option value="default">
                    {t('wishlist.sort.default', 'Mặc định')}
                  </option>
                  <option value="price-asc">
                    {t('wishlist.sort.priceAsc', 'Giá thấp trước')}
                  </option>
                  <option value="price-desc">
                    {t('wishlist.sort.priceDesc', 'Giá cao trước')}
                  </option>
                  <option value="rating">
                    {t('wishlist.sort.rating', 'Đánh giá cao')}
                  </option>
                </select>
              </div>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
              >
                <Trash2 size={14} />
                {t('wishlist.clearAll', 'Xóa tất cả')}
              </button>
            </div>
          )}
        </div>

        {/* Wishlisted items grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-ddms-bg-card rounded-2xl border border-border p-4 space-y-4 shadow-sm"
              >
                <Skeleton className="aspect-4/3 w-full rounded-xl" />
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
        ) : sortedTours.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-ddms-bg-card py-24 text-center max-w-2xl mx-auto shadow-md relative overflow-hidden mt-12">
            {/* Background design accents */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-ddms-secondary/5 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-ddms-secondary/5 blur-3xl" />

            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff385c]/10 text-[#ff385c] mb-6 animate-pulse">
                <Heart size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t('wishlist.empty.title', 'Danh sách trống')}
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
                {t(
                  'wishlist.empty.subtitle',
                  'Bạn chưa lưu tour nào vào danh sách yêu thích. Hãy quay lại trang chủ và khám phá các tour hấp dẫn nhé!',
                )}
              </p>
              <Link
                to={routeName.home}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ddms-secondary px-8 py-3 font-semibold text-primary-foreground transition-all hover:bg-ddms-secondary/90 hover:scale-105 active:scale-95 shadow-md shadow-ddms-secondary/20"
              >
                {t('wishlist.empty.button', 'Khám phá ngay')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedTours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-ddms-bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-ddms-secondary/20"
              >
                {/* Photo container */}
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <img
                    src={
                      tour.imageUrl ||
                      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop'
                    }
                    alt={tour.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Glassmorphic quick remove button */}
                  <button
                    onClick={(e) => removeWishlist(tour.id, e)}
                    className="absolute right-3 top-3 rounded-full p-2.5 transition-all duration-300 bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-[#ff385c] hover:border-[#ff385c] hover:scale-110 active:scale-95 shadow-md group/heart"
                    title={t('wishlist.remove', 'Xóa khỏi yêu thích')}
                  >
                    <Heart
                      size={16}
                      fill="currentColor"
                      className="transition-colors duration-300 text-white"
                    />
                  </button>
                </div>

                {/* Content body */}
                <div className="flex flex-col flex-1 p-4 justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="line-clamp-2 text-base font-bold text-foreground leading-tight min-h-10"
                        title={tour.name}
                      >
                        {tour.name}
                      </h3>
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">
                          {tour.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin
                        size={13}
                        className="shrink-0 text-muted-foreground"
                      />
                      <span className="line-clamp-1">
                        {tour.location || 'N/A'}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDuration(tour.durationMinutes)} ·{' '}
                      {tour.totalReviews}{' '}
                      {t('wishlist.reviewsCount', 'đánh giá')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {t('wishlist.priceFrom', 'Giá từ')}
                      </p>
                      <p className="text-base font-extrabold text-ddms-secondary mt-0.5">
                        {formatPrice(tour.price)}
                        <span className="text-xs font-normal text-muted-foreground">
                          {' '}
                          / {t('wishlist.perPerson', 'người')}
                        </span>
                      </p>
                    </div>

                    <span className="text-xs font-bold text-ddms-secondary bg-ddms-secondary/10 px-3 py-1.5 rounded-full transition-all group-hover:bg-ddms-secondary group-hover:text-primary-foreground">
                      {t('wishlist.viewDetail', 'Chi tiết')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
