import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Star,
  Heart,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Pagination from '@/components/shared/pagination';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  tourService,
  type TourSearchItemResponse,
} from '@/services/tourService';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/hooks/use-auth';

const CATEGORIES = [
  { key: 'all', icon: '🌊' },
  { key: 'cruise', icon: '🚢' },
  { key: 'sunset', icon: '🌅' },
  { key: 'party', icon: '🎉' },
  { key: 'family', icon: '👨‍👩‍👧‍👦' },
  { key: 'sightseeing', icon: '📸' },
  { key: 'dinner', icon: '🍽️' },
];

const SORT_OPTIONS = ['rating', 'priceAsc', 'priceDesc'] as const;

export default function TourListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('location') || '',
  );
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('rating');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [tours, setTours] = useState<TourSearchItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sync searchQuery with URL params if it changes
  useEffect(() => {
    const loc = searchParams.get('location');
    if (loc !== null && loc !== searchQuery) {
      setSearchQuery(loc);
      setCurrentPage(1);
    }
  }, [searchParams, searchQuery]);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const apiSortBy = sortBy === 'rating' ? 'rating' : 'price';
        const apiSortOrder = sortBy === 'priceAsc' ? 'asc' : 'desc';

        const res = await tourService.searchTours({
          page: currentPage,
          pageSize: 8,
          sortBy: apiSortBy,
          sortOrder: apiSortOrder,
          location: debouncedSearch || undefined, // use search query as location/name filter
        });

        setTours(res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.totalItems || 0);
      } catch (error) {
        console.error('Failed to fetch tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [currentPage, debouncedSearch, sortBy, activeCategory]);

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

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} ${t('tourList.hours', 'giờ')}`;
    return `${mins} ${t('tourList.minutes', 'phút')}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[28px] font-bold leading-[1.43] text-foreground"
          style={{ letterSpacing: '-0.44px' }}
        >
          {t('tourList.title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('tourList.subtitle', { count: totalRecords })}
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border px-4 bg-ddms-bg-card shadow-xs">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder={t('tourList.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border-none bg-transparent py-3 text-sm font-medium outline-none text-foreground"
          />
          {searchQuery && (
            <button onClick={() => handleSearchChange('')}>
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Sort + Filter Toggle */}
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium outline-none bg-ddms-bg-card text-foreground cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-ddms-bg-card text-foreground"
              >
                {t(`tourList.sort.${opt}`)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98] sm:hidden text-foreground bg-ddms-bg-card cursor-pointer"
          >
            <SlidersHorizontal size={16} />
            {t('tourList.filters')}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div
        className={`mb-8 flex gap-3 overflow-x-auto pb-1 ${showFilters ? '' : 'hidden sm:flex'}`}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98] cursor-pointer ${
                isActive
                  ? 'bg-ddms-secondary/15 text-ddms-secondary border-ddms-secondary/35'
                  : 'bg-ddms-bg-card text-muted-foreground border-border hover:bg-foreground/5'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {t(`tourList.categories.${cat.key}`)}
            </button>
          );
        })}
      </div>

      {/* Tour Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
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
      ) : tours.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="group overflow-hidden rounded-2xl transition-all border border-border bg-ddms-bg-card shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-16/11 overflow-hidden bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop"
                    alt={tour.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(tour.id);
                    }}
                    className="absolute right-3 top-3 rounded-full p-2 transition-all hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(0,240,255,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Heart
                      size={18}
                      className={
                        wishlist.includes(tour.id)
                          ? 'fill-ddms-secondary text-ddms-secondary'
                          : 'text-white'
                      }
                    />
                  </button>
                </div>

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
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={13} className="shrink-0" />
                    <span className="line-clamp-1">
                      {tour.location || 'N/A'}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDuration(tour.durationMinutes)} · {tour.totalReviews}{' '}
                    {t('tourList.reviews')}
                  </p>
                  <p className="mt-3 text-base font-semibold text-ddms-secondary">
                    {formatPrice(tour.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {' '}
                      / {t('tourList.perPerson')}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: '#112240' }}
          >
            <Search size={28} style={{ color: '#ecf0ff' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            {t('tourList.empty.title')}
          </h3>
          <p className="mt-2 max-w-sm text-sm" style={{ color: '#ecf0ff' }}>
            {t('tourList.empty.description')}
          </p>
          <Button
            variant="cyan"
            size="action"
            onClick={() => {
              handleSearchChange('');
              handleCategoryChange('all');
            }}
            className="mt-6"
          >
            {t('tourList.empty.reset')}
          </Button>
        </div>
      )}
    </div>
  );
}
