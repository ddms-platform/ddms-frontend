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
  Loader2,
} from 'lucide-react';
import Pagination from '@/components/shared/pagination';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  tourService,
  type TourSearchItemResponse,
} from '@/services/tourService';
import { useDebounce } from '@/hooks/use-debounce';

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
  }, [searchParams]);

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

  useEffect(() => {
    fetchTours();
  }, [currentPage, debouncedSearch, sortBy, activeCategory]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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
          className="text-[28px] font-bold leading-[1.43]"
          style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
        >
          {t('tourList.title')}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#ecf0ff' }}>
          {t('tourList.subtitle', { count: totalRecords })}
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div
          className="flex flex-1 items-center gap-3 rounded-xl border px-4"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <Search size={18} style={{ color: '#ecf0ff' }} />
          <input
            type="text"
            placeholder={t('tourList.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border-none bg-transparent py-3 text-sm font-medium outline-none"
            style={{ color: '#ffffff' }}
          />
          {searchQuery && (
            <button onClick={() => handleSearchChange('')}>
              <X size={16} style={{ color: '#ecf0ff' }} />
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
            className="rounded-xl border px-4 py-3 text-sm font-medium outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(`tourList.sort.${opt}`)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98] sm:hidden"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
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
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className="flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
            style={{
              borderColor:
                activeCategory === cat.key
                  ? '#00F0FF'
                  : 'rgba(255,255,255,0.15)',
              backgroundColor:
                activeCategory === cat.key ? 'rgba(0,240,255,0.08)' : '#112240',
              color: activeCategory === cat.key ? '#00F0FF' : '#ffffff',
            }}
          >
            <span className="text-base">{cat.icon}</span>
            {t(`tourList.categories.${cat.key}`)}
          </button>
        ))}
      </div>

      {/* Tour Grid */}
      {loading ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Loader2 size={36} className="animate-spin text-[#00F0FF]" />
        </div>
      ) : tours.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="group overflow-hidden rounded-2xl transition-all hover:shadow-lg"
                style={{
                  backgroundColor: '#112240',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <div className="relative aspect-16/11 overflow-hidden bg-[#1a2e4c]">
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
                    className="absolute right-3 top-3 rounded-full p-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: 'rgba(0,240,255,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Heart
                      size={18}
                      fill={wishlist.includes(tour.id) ? '#00F0FF' : 'none'}
                      style={{
                        color: wishlist.includes(tour.id)
                          ? '#00F0FF'
                          : '#ffffff',
                      }}
                    />
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
                      <Star
                        size={14}
                        fill="#ffc107"
                        style={{ color: '#ffc107' }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: '#ffffff' }}
                      >
                        {tour.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p
                    className="mt-1 flex items-center gap-1 text-sm"
                    style={{ color: '#ecf0ff' }}
                  >
                    <MapPin size={13} className="shrink-0" />
                    <span className="line-clamp-1">
                      {tour.location || 'N/A'}
                    </span>
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                    {formatDuration(tour.durationMinutes)} · {tour.totalReviews}{' '}
                    {t('tourList.reviews')}
                  </p>
                  <p
                    className="mt-3 text-base font-semibold"
                    style={{ color: '#00F0FF' }}
                  >
                    {formatPrice(tour.price)}
                    <span
                      className="text-sm font-normal"
                      style={{ color: '#ecf0ff' }}
                    >
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
