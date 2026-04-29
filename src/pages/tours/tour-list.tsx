import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, Heart, SlidersHorizontal, X } from 'lucide-react';
import Pagination from '@/components/shared/pagination';
import { formatPrice, getLocalizedField } from '@/lib/utils';
import { usePagination } from '@/hooks/use-pagination';

const ALL_TOURS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop',
    title_vn: 'Tour Sông Hàn Về Đêm',
    title_en: 'Han River Night Tour',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 350000,
    rating: 4.9,
    reviews: 128,
    duration_vn: '2 giờ',
    duration_en: '2 hours',
    category: 'cruise',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop',
    title_vn: 'Khám Phá Ngũ Hành Sơn',
    title_en: 'Marble Mountains Discovery',
    location_vn: 'Ngũ Hành Sơn, Đà Nẵng',
    location_en: 'Marble Mountains, Da Nang',
    price: 500000,
    rating: 4.8,
    reviews: 96,
    duration_vn: '3 giờ',
    duration_en: '3 hours',
    category: 'sightseeing',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=600&h=400&fit=crop',
    title_vn: 'Du Thuyền Cầu Rồng',
    title_en: 'Dragon Bridge Cruise',
    location_vn: 'Cầu Rồng, Đà Nẵng',
    location_en: 'Dragon Bridge, Da Nang',
    price: 450000,
    rating: 4.7,
    reviews: 203,
    duration_vn: '2.5 giờ',
    duration_en: '2.5 hours',
    category: 'cruise',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop',
    title_vn: 'Tour Hoàng Hôn Sông Hàn',
    title_en: 'Han River Sunset Tour',
    location_vn: 'Bến Bạch Đằng, Đà Nẵng',
    location_en: 'Bach Dang Wharf, Da Nang',
    price: 400000,
    rating: 4.9,
    reviews: 167,
    duration_vn: '1.5 giờ',
    duration_en: '1.5 hours',
    category: 'sunset',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    title_vn: 'Tiệc BBQ Trên Thuyền',
    title_en: 'BBQ Party on Boat',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 750000,
    rating: 4.6,
    reviews: 54,
    duration_vn: '3 giờ',
    duration_en: '3 hours',
    category: 'dinner',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    title_vn: 'Tour Gia Đình Sông Hàn',
    title_en: 'Han River Family Tour',
    location_vn: 'Bến Bạch Đằng, Đà Nẵng',
    location_en: 'Bach Dang Wharf, Da Nang',
    price: 300000,
    rating: 4.8,
    reviews: 89,
    duration_vn: '2 giờ',
    duration_en: '2 hours',
    category: 'family',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
    title_vn: 'Party Boat Đà Nẵng',
    title_en: 'Da Nang Party Boat',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 600000,
    rating: 4.5,
    reviews: 72,
    duration_vn: '4 giờ',
    duration_en: '4 hours',
    category: 'party',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&h=400&fit=crop',
    title_vn: 'Ngắm Bình Minh Trên Sông',
    title_en: 'River Sunrise Tour',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 280000,
    rating: 4.9,
    reviews: 41,
    duration_vn: '1.5 giờ',
    duration_en: '1.5 hours',
    category: 'sightseeing',
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&h=400&fit=crop',
    title_vn: 'Tour Cù Lao Chàm',
    title_en: 'Cham Island Tour',
    location_vn: 'Cù Lao Chàm, Hội An',
    location_en: 'Cham Island, Hoi An',
    price: 900000,
    rating: 4.8,
    reviews: 112,
    duration_vn: '8 giờ',
    duration_en: '8 hours',
    category: 'cruise',
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=400&fit=crop',
    title_vn: 'Hoàng Hôn Bãi Biển Mỹ Khê',
    title_en: 'My Khe Beach Sunset',
    location_vn: 'Mỹ Khê, Đà Nẵng',
    location_en: 'My Khe, Da Nang',
    price: 250000,
    rating: 4.7,
    reviews: 63,
    duration_vn: '1.5 giờ',
    duration_en: '1.5 hours',
    category: 'sunset',
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop',
    title_vn: 'Du Thuyền VIP Sông Hàn',
    title_en: 'VIP Han River Cruise',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 1200000,
    rating: 4.9,
    reviews: 34,
    duration_vn: '3 giờ',
    duration_en: '3 hours',
    category: 'dinner',
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&h=400&fit=crop',
    title_vn: 'Tour Chèo SUP Sông Hàn',
    title_en: 'Han River SUP Tour',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 350000,
    rating: 4.6,
    reviews: 47,
    duration_vn: '2 giờ',
    duration_en: '2 hours',
    category: 'family',
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1517627043994-b991abb62fc8?w=600&h=400&fit=crop',
    title_vn: 'Đêm Nhạc Trên Du Thuyền',
    title_en: 'Live Music Cruise Night',
    location_vn: 'Bến Bạch Đằng, Đà Nẵng',
    location_en: 'Bach Dang Wharf, Da Nang',
    price: 550000,
    rating: 4.4,
    reviews: 28,
    duration_vn: '3 giờ',
    duration_en: '3 hours',
    category: 'party',
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop',
    title_vn: 'Tour Cầu Vàng Bà Nà',
    title_en: 'Golden Bridge Ba Na Tour',
    location_vn: 'Bà Nà Hills, Đà Nẵng',
    location_en: 'Ba Na Hills, Da Nang',
    price: 800000,
    rating: 4.9,
    reviews: 256,
    duration_vn: '6 giờ',
    duration_en: '6 hours',
    category: 'sightseeing',
  },
  {
    id: 15,
    image: 'https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=600&h=400&fit=crop',
    title_vn: 'Tour Câu Cá Sông Hàn',
    title_en: 'Han River Fishing Tour',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 320000,
    rating: 4.3,
    reviews: 19,
    duration_vn: '4 giờ',
    duration_en: '4 hours',
    category: 'family',
  },
  {
    id: 16,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop',
    title_vn: 'Ăn Tối Trên Sông Hàn',
    title_en: 'Dinner on Han River',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 680000,
    rating: 4.7,
    reviews: 85,
    duration_vn: '2.5 giờ',
    duration_en: '2.5 hours',
    category: 'dinner',
  },
  {
    id: 17,
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop',
    title_vn: 'Sunrise Tour Sơn Trà',
    title_en: 'Son Tra Sunrise Tour',
    location_vn: 'Bán đảo Sơn Trà, Đà Nẵng',
    location_en: 'Son Tra Peninsula, Da Nang',
    price: 380000,
    rating: 4.8,
    reviews: 73,
    duration_vn: '3 giờ',
    duration_en: '3 hours',
    category: 'sightseeing',
  },
  {
    id: 18,
    image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=400&fit=crop',
    title_vn: 'Du Thuyền Đêm Trăng',
    title_en: 'Moonlight Cruise',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    price: 420000,
    rating: 4.6,
    reviews: 58,
    duration_vn: '2 giờ',
    duration_en: '2 hours',
    category: 'cruise',
  },
  {
    id: 19,
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop',
    title_vn: 'Pool Party Thuyền Buồm',
    title_en: 'Sailboat Pool Party',
    location_vn: 'Biển Mỹ Khê, Đà Nẵng',
    location_en: 'My Khe Beach, Da Nang',
    price: 850000,
    rating: 4.5,
    reviews: 31,
    duration_vn: '5 giờ',
    duration_en: '5 hours',
    category: 'party',
  },
  {
    id: 20,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    title_vn: 'Tour Gia Đình Cù Lao Chàm',
    title_en: 'Cham Island Family Tour',
    location_vn: 'Cù Lao Chàm, Hội An',
    location_en: 'Cham Island, Hoi An',
    price: 750000,
    rating: 4.8,
    reviews: 94,
    duration_vn: '7 giờ',
    duration_en: '7 hours',
    category: 'family',
  },
];

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
  const { t, i18n } = useTranslation();
  const lang = i18n.language; // 'vn' | 'en'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('rating');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Filter & Sort
  const filtered = ALL_TOURS.filter((tour) => {
    const matchSearch =
      !searchQuery ||
      getLocalizedField(tour, 'title', lang).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedField(tour, 'location', lang).toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === 'all' || tour.category === activeCategory;
    return matchSearch && matchCategory;
  });

  if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  if (sortBy === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'priceDesc') filtered.sort((a, b) => b.price - a.price);

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedTours,
    goToPage,
    resetPage,
  } = usePagination(filtered, { itemsPerPage: 8 });

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    resetPage();
  };
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
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
          {t('tourList.subtitle', { count: filtered.length })}
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
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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
              borderColor: activeCategory === cat.key ? '#00F0FF' : 'rgba(255,255,255,0.15)',
              backgroundColor: activeCategory === cat.key ? 'rgba(0,240,255,0.08)' : '#112240',
              color: activeCategory === cat.key ? '#00F0FF' : '#ffffff',
            }}
          >
            <span className="text-base">{cat.icon}</span>
            {t(`tourList.categories.${cat.key}`)}
          </button>
        ))}
      </div>

      {/* Tour Grid */}
      {filtered.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedTours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.id}`}
                className="group overflow-hidden rounded-2xl transition-all hover:shadow-lg"
                style={{
                  backgroundColor: '#112240',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <div className="relative aspect-16/11 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={getLocalizedField(tour, 'title', lang)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(tour.id);
                    }}
                    className="absolute right-3 top-3 rounded-full p-2 transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(0,240,255,0.15)', backdropFilter: 'blur(8px)' }}
                  >
                    <Heart
                      size={18}
                      fill={wishlist.includes(tour.id) ? '#00F0FF' : 'none'}
                      style={{ color: wishlist.includes(tour.id) ? '#00F0FF' : '#ffffff' }}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>
                      {getLocalizedField(tour, 'title', lang)}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      <Star size={14} fill="#ffc107" style={{ color: '#ffc107' }} />
                      <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                        {tour.rating}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: '#ecf0ff' }}>
                    <MapPin size={13} />
                    {getLocalizedField(tour, 'location', lang)}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                    {getLocalizedField(tour, 'duration', lang)} · {tour.reviews}{' '}
                    {t('tourList.reviews')}
                  </p>
                  <p className="mt-3 text-base font-semibold" style={{ color: '#00F0FF' }}>
                    {formatPrice(tour.price)}
                    <span className="text-sm font-normal" style={{ color: '#ecf0ff' }}>
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
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
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
          <button
            onClick={() => {
              handleSearchChange('');
              handleCategoryChange('all');
            }}
            className="mt-6 rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#00F0FF', color: '#ffffff' }}
          >
            {t('tourList.empty.reset')}
          </button>
        </div>
      )}
    </div>
  );
}
