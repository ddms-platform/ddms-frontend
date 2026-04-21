import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ChevronRight, Heart } from 'lucide-react';

const FEATURED_TOURS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop',
    title: 'Tour Sông Hàn Về Đêm',
    location: 'Sông Hàn, Đà Nẵng',
    price: 350000,
    rating: 4.9,
    reviews: 128,
    duration: '2 giờ',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop',
    title: 'Khám Phá Ngũ Hành Sơn',
    location: 'Ngũ Hành Sơn, Đà Nẵng',
    price: 500000,
    rating: 4.8,
    reviews: 96,
    duration: '3 giờ',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=600&h=400&fit=crop',
    title: 'Du Thuyền Cầu Rồng',
    location: 'Cầu Rồng, Đà Nẵng',
    price: 450000,
    rating: 4.7,
    reviews: 203,
    duration: '2.5 giờ',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop',
    title: 'Tour Hoàng Hôn Sông Hàn',
    location: 'Bến Bạch Đằng, Đà Nẵng',
    price: 400000,
    rating: 4.9,
    reviews: 167,
    duration: '1.5 giờ',
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function FeaturedTours() {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <section id="tours" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            {t('home.tours.title')}
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#6a6a6a' }}>
            {t('home.tours.subtitle')}
          </p>
        </div>
        <Link
          to="/tours"
          className="hidden items-center gap-1 text-sm font-semibold transition-colors hover:underline sm:flex"
          style={{ color: '#222222' }}
        >
          {t('home.tours.viewAll')}
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_TOURS.map((tour) => (
          <Link
            key={tour.id}
            to={`/tours/${tour.id}`}
            className="group overflow-hidden rounded-2xl transition-all hover:shadow-lg"
            style={{
              boxShadow:
                'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            {/* Image */}
            <div className="relative aspect-16/11 overflow-hidden">
              <img
                src={tour.image}
                alt={tour.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(tour.id);
                }}
                className="absolute right-3 top-3 rounded-full p-2 transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
              >
                <Heart
                  size={18}
                  fill={wishlist.includes(tour.id) ? '#ff385c' : 'none'}
                  style={{ color: wishlist.includes(tour.id) ? '#ff385c' : '#222222' }}
                />
              </button>
            </div>

            {/* Details */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold" style={{ color: '#222222' }}>
                  {tour.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1">
                  <Star size={14} fill="#222222" style={{ color: '#222222' }} />
                  <span className="text-sm font-medium" style={{ color: '#222222' }}>
                    {tour.rating}
                  </span>
                </div>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}>
                <MapPin size={13} />
                {tour.location}
              </p>
              <p className="mt-1 text-sm" style={{ color: '#6a6a6a' }}>
                {tour.duration} · {tour.reviews} {t('home.tours.reviews')}
              </p>
              <p className="mt-3 text-base font-semibold" style={{ color: '#222222' }}>
                {formatPrice(tour.price)}
                <span className="text-sm font-normal" style={{ color: '#6a6a6a' }}>
                  {' '}
                  / {t('home.tours.perPerson')}
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
