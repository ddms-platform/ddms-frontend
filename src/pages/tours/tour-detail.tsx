import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/shared/breadcrumb';
import TourGallery from './components/tour-gallery';
import TourInfo from './components/tour-info';
import TourReviews from './components/tour-reviews';
import BookingSidebar from './components/booking-sidebar';
import { formatPrice, getLocalizedField } from '@/lib/utils';

// Mock tour data
const MOCK_TOUR = {
  id: 1,
  title: 'Tour Sông Hàn Về Đêm',
  location: 'Sông Hàn, Đà Nẵng',
  price: 350000,
  rating: 4.9,
  reviews: 128,
  duration: '2 giờ',
  maxGuests: 30,
  boatName: 'Dragon Cruise',
  description:
    'Trải nghiệm du thuyền tuyệt vời trên sông Hàn vào ban đêm. Ngắm nhìn cầu Rồng phun lửa, cầu Sông Hàn quay, và toàn cảnh thành phố Đà Nẵng lung linh ánh đèn. Tour bao gồm đồ uống chào mừng, hướng dẫn viên song ngữ, và âm nhạc sống trên thuyền.',
  images: [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=675&fit=crop',
  ],
  reviewsList: [
    {
      id: 1,
      name: 'Minh Anh',
      avatar: '',
      rating: 5,
      date: '15/04/2026',
      comment: 'Tuyệt vời! Cảnh đêm sông Hàn rất đẹp, nhân viên phục vụ tận tình, đồ uống ngon.',
    },
    {
      id: 2,
      name: 'Thanh Hoa',
      avatar: '',
      rating: 5,
      date: '12/04/2026',
      comment:
        'Đáng giá từng đồng! Con gái tôi rất thích khi thấy cầu Rồng phun lửa từ trên thuyền.',
    },
    {
      id: 3,
      name: 'David Kim',
      avatar: '',
      rating: 4,
      date: '08/04/2026',
      comment:
        'Great experience! Beautiful night views of Da Nang. Would recommend to any tourist.',
    },
    {
      id: 4,
      name: 'Hương Giang',
      avatar: '',
      rating: 5,
      date: '05/04/2026',
      comment: 'Lần thứ 2 đi rồi mà vẫn thấy hay. Tour rất chuyên nghiệp và đúng giờ.',
    },
  ],
};

export default function TourDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { id } = useParams();
  const tour = { ...MOCK_TOUR, id: Number(id) || MOCK_TOUR.id };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.tours'), to: '/tours' },
          { label: getLocalizedField(tour, 'title', lang) },
        ]}
      />

      {/* Gallery */}
      <TourGallery images={tour.images} title={tour.title} />

      {/* Content + Sidebar */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: Tour Details */}
        <div>
          <TourInfo
            title={tour.title}
            location={tour.location}
            duration={tour.duration}
            maxGuests={tour.maxGuests}
            boatName={tour.boatName}
            rating={tour.rating}
            reviews={tour.reviews}
            description={tour.description}
          />
          <TourReviews
            reviews={tour.reviewsList}
            averageRating={tour.rating}
            totalReviews={tour.reviews}
          />
        </div>

        {/* Right: Booking Sidebar */}
        <div className="hidden lg:block">
          <BookingSidebar tourId={tour.id} price={tour.price} />
        </div>
      </div>

      {/* Mobile Sticky Book Bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t px-6 py-4 lg:hidden"
        style={{
          backgroundColor: '#0A192F',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <span className="text-lg font-bold" style={{ color: '#ffffff' }}>
            {formatPrice(tour.price)}
          </span>
          <span className="text-sm" style={{ color: '#ecf0ff' }}>
            {' '}
            / {t('tour.booking.perPerson')}
          </span>
        </div>
        <Link
          to={`/tours/${tour.id}/booking`}
          className="rounded-lg px-6 py-3 text-sm font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#00F0FF' }}
        >
          {t('tour.booking.bookNow')}
        </Link>
      </div>
    </div>
  );
}
