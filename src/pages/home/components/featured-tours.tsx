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

const getMockTours = (language: string): TourSearchItemResponse[] => [
  {
    id: 'mock-1',
    name:
      language === 'EN'
        ? 'Sparkling Han River Night Cruise'
        : 'Tour du thuyền Sông Hàn đêm lung linh',
    price: 150000,
    description:
      language === 'EN'
        ? "Admire Da Nang's legendary bridges from the Han River."
        : 'Ngắm nhìn các cây cầu huyền thoại của Đà Nẵng từ sông Hàn.',
    durationMinutes: 90,
    location: language === 'EN' ? 'Han River, Da Nang' : 'Sông Hàn, Đà Nẵng',
    status: 'Active',
    avgRating: 4.8,
    totalReviews: 142,
    cancelPolicy: 'Free Cancellation',
    cancelHours: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-2',
    name:
      language === 'EN'
        ? 'Luxury Catamaran Sunset Cruise'
        : 'Du thuyền hạng sang ngắm hoàng hôn Vịnh Đà Nẵng',
    price: 950000,
    description:
      language === 'EN'
        ? 'Romantic sunset experience on the bay with light wine.'
        : 'Trải nghiệm ngắm hoàng hôn lãng mạn trên biển cùng tiệc rượu nhẹ.',
    durationMinutes: 180,
    location: language === 'EN' ? 'Da Nang Bay' : 'Vịnh Đà Nẵng',
    status: 'Active',
    avgRating: 4.9,
    totalReviews: 86,
    cancelPolicy: 'Non-refundable',
    cancelHours: null,
    imageUrl:
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-3',
    name:
      language === 'EN'
        ? 'Sơn Trà Coral Diving & Fishing Tour'
        : 'Lặn ngắm san hô & Câu cá Bán đảo Sơn Trà',
    price: 650000,
    description:
      language === 'EN'
        ? 'Explore the rich marine world at Sơn Trà coral reefs.'
        : 'Khám phá thế giới đại dương phong phú tại các rạn san hô Sơn Trà.',
    durationMinutes: 240,
    location: language === 'EN' ? 'Sơn Trà Peninsula' : 'Bán đảo Sơn Trà',
    status: 'Active',
    avgRating: 4.7,
    totalReviews: 98,
    cancelPolicy: 'Free Cancellation',
    cancelHours: 48,
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-4',
    name:
      language === 'EN'
        ? 'Cham Island Discovery by Speedboat'
        : 'Hành trình đảo Cù Lao Chàm bằng Cano cao tốc',
    price: 850000,
    description:
      language === 'EN'
        ? 'All-inclusive trip to explore the UNESCO Biosphere Reserve.'
        : 'Hành trình trọn gói khám phá Khu dự trữ sinh quyển thế giới.',
    durationMinutes: 480,
    location: language === 'EN' ? 'Cham Island' : 'Cù Lao Chàm',
    status: 'Active',
    avgRating: 4.6,
    totalReviews: 215,
    cancelPolicy: 'Free Cancellation',
    cancelHours: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-5',
    name:
      language === 'EN'
        ? 'Mỹ Khê Beach Sunrise SUP Paddling'
        : 'Chèo SUP ngắm bình minh trên biển Mỹ Khê',
    price: 250000,
    description:
      language === 'EN'
        ? 'Catch the first rays of the day on a paddleboard.'
        : 'Đón những tia nắng đầu ngày cực chill trên ván chèo đứng.',
    durationMinutes: 120,
    location: language === 'EN' ? 'Mỹ Khê Beach' : 'Biển Mỹ Khê',
    status: 'Active',
    avgRating: 4.8,
    totalReviews: 64,
    cancelPolicy: 'Free Cancellation',
    cancelHours: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-6',
    name:
      language === 'EN'
        ? 'Squid Fishing with Local Fishermen'
        : 'Tour câu mực đêm cùng Ngư dân địa phương',
    price: 500000,
    description:
      language === 'EN'
        ? 'Experience authentic fishing and enjoy fresh seafood on board.'
        : 'Trải nghiệm làm ngư dân thực thụ và chế biến hải sản tươi sống.',
    durationMinutes: 300,
    location: language === 'EN' ? 'Da Nang Sea' : 'Biển Đà Nẵng',
    status: 'Active',
    avgRating: 4.5,
    totalReviews: 32,
    cancelPolicy: 'Non-refundable',
    cancelHours: null,
    imageUrl:
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-7',
    name:
      language === 'EN'
        ? 'Private Speedboat Rental to Son Tra Caves'
        : 'Thuê Cano riêng khám phá hang động nước Sơn Trà',
    price: 1800000,
    description:
      language === 'EN'
        ? 'Customizable itinerary to explore Son Tra caves.'
        : 'Tự do thiết kế lịch trình khám phá Sơn Trà cùng gia đình.',
    durationMinutes: 240,
    location: language === 'EN' ? 'Sơn Trà Peninsula' : 'Bán đảo Sơn Trà',
    status: 'Active',
    avgRating: 4.9,
    totalReviews: 45,
    cancelPolicy: 'Free Cancellation',
    cancelHours: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
  {
    id: 'mock-8',
    name:
      language === 'EN'
        ? 'Bay Mau Coconut Forest Basket Boat Tour'
        : 'Khám phá rừng dừa Bảy Mẫu bằng Thuyền thúng',
    price: 300000,
    description:
      language === 'EN'
        ? 'Spin in a basket boat and navigate the nipa palms.'
        : 'Trải nghiệm múa thúng chai và luồn lách qua các rặng dừa nước.',
    durationMinutes: 120,
    location: language === 'EN' ? 'Hoi An - Da Nang' : 'Hội An - Đà Nẵng',
    status: 'Active',
    avgRating: 4.7,
    totalReviews: 188,
    cancelPolicy: 'Free Cancellation',
    cancelHours: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
    availableSlots: [],
  },
];

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
        let apiTours: TourSearchItemResponse[] = [];
        try {
          const res = await tourService.searchTours({
            pageSize: 8,
            sortBy: 'rating',
            sortOrder: 'desc',
          });
          apiTours = res.items || [];
        } catch (apiError) {
          console.warn('API call failed, falling back to mock data:', apiError);
        }

        // Combine API results with mock tours, ensuring no duplicate IDs
        const mockList = getMockTours(i18n.language.toUpperCase());
        const combined = [...apiTours];
        mockList.forEach((mock) => {
          if (
            !combined.some(
              (t) =>
                t.id === mock.id ||
                t.name.toLowerCase() === mock.name.toLowerCase(),
            )
          ) {
            combined.push(mock);
          }
        });

        setTours(combined);
      } catch (error) {
        console.error('Failed to fetch featured tours:', error);
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
          <div className="flex h-40 items-center justify-center text-[#ecf0ff]/60">
            {t('home.tours.noTours')}
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
                  className={`group relative flex-none w-75 h-75 sm:w-92.5 sm:h-92.5 rounded-[24px] overflow-hidden transition-all duration-500 hover:scale-[0.98] snap-start ${
                    isVisible ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Full Card background image */}
                  <img
                    src={
                      tour.imageUrl ||
                      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop'
                    }
                    alt={tour.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-0"
                  />

                  {/* Dark gradient overlay for typography readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent z-0" />

                  {/* Top Right Heart Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(tour.id);
                    }}
                    className="absolute right-4 top-4 rounded-full p-2.5 transition-all hover:scale-110 z-10"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
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

                  {/* Bottom details overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col gap-1.5">
                    {/* Location label */}
                    <span className="text-[11px] uppercase tracking-wider text-ddms-secondary font-bold flex items-center gap-1">
                      <MapPin size={12} className="shrink-0" />
                      {tour.location || 'Đà Nẵng'}
                    </span>

                    {/* Destination/Tour name title */}
                    <h3
                      className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2"
                      title={tour.name}
                    >
                      {tour.name}
                    </h3>

                    {/* Price and Rating row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-white/90 text-sm">
                      <div className="flex items-center gap-1 font-semibold text-ddms-secondary">
                        <span>{formatPrice(tour.price)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/80">
                        <Star
                          size={13}
                          fill="#ffc107"
                          style={{ color: '#ffc107' }}
                        />
                        <span className="font-semibold text-white">
                          {tour.avgRating.toFixed(1)}
                        </span>
                        <span className="text-white/60">
                          ({tour.totalReviews})
                        </span>
                      </div>
                    </div>
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
