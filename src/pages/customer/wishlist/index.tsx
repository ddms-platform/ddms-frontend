import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Star, Loader2, ArrowLeft } from 'lucide-react';
import { wishlistService } from '@/services/wishlistService';
import type { TourSearchItemResponse } from '@/services/tourService';
import { formatPrice } from '@/lib/utils';
import { routeName } from '@/constants/route-name';
import GlobalHeader from '@/components/layouts/global-header';

export default function WishlistPage() {
  const { t } = useTranslation();
  const [tours, setTours] = useState<TourSearchItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      setTours((prev) => prev.filter((t) => t.id !== id));
      await wishlistService.toggleWishlist(id);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
      fetchWishlist(); // Revert on error
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
    <div className="min-h-screen bg-[#0A192F]">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link
            to={routeName.home}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: '#ecf0ff' }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>
              {t('wishlist.title', 'Tour yêu thích của bạn')}
            </h1>
            <p className="mt-1 text-[#ecf0ff]">
              {t(
                'wishlist.subtitle',
                'Quản lý các tour du lịch mà bạn đã lưu lại.',
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#00F0FF]" />
          </div>
        ) : tours.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#112240] py-20 text-center">
            <Heart size={64} className="mb-4 text-[#ff385c]/20" />
            <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
              {t('wishlist.empty.title', 'Danh sách trống')}
            </h2>
            <p className="mt-2 max-w-md text-[#ecf0ff]">
              {t(
                'wishlist.empty.subtitle',
                'Bạn chưa lưu tour nào vào danh sách yêu thích. Hãy quay lại trang chủ và khám phá các tour hấp dẫn nhé!',
              )}
            </p>
            <Link
              to={routeName.home}
              className="mt-6 rounded-full bg-[#00F0FF] px-6 py-2.5 font-semibold text-[#0A192F] transition-all hover:bg-[#00d4e0]"
            >
              {t('wishlist.empty.button', 'Khám phá ngay')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="group relative overflow-hidden rounded-2xl bg-[#112240] transition-all hover:shadow-lg"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={
                      tour.imageUrl ||
                      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop'
                    }
                    alt={tour.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => removeWishlist(tour.id, e)}
                    className="absolute right-3 top-3 rounded-full p-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                    }}
                    title="Bỏ thích"
                  >
                    <Heart size={18} fill="#ff385c" style={{ color: '#ff385c' }} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="line-clamp-1 text-base font-semibold"
                      style={{ color: '#ffffff' }}
                      title={tour.name}
                    >
                      {tour.name}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      <Star size={14} fill="#ffc107" style={{ color: '#ffc107' }} />
                      <span className="text-sm font-medium text-white">
                        {tour.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-[#ecf0ff]">
                    <MapPin size={13} className="shrink-0" />
                    <span className="line-clamp-1">
                      {tour.location || 'N/A'}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-[#ecf0ff]">
                    {formatDuration(tour.durationMinutes)} · {tour.totalReviews}{' '}
                    đánh giá
                  </p>
                  <p className="mt-3 text-base font-semibold text-[#00F0FF]">
                    {formatPrice(tour.price)}
                    <span className="text-sm font-normal text-[#ecf0ff]">
                      {' '}
                      / người
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
