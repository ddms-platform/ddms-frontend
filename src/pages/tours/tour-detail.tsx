import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/shared/breadcrumb';
import TourGallery from './components/tour-gallery';
import TourInfo from './components/tour-info';
import TourReviews from './components/tour-reviews';
import BookingSidebar from './components/booking-sidebar';
import { formatPrice, getLocalizedField } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function TourDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { id } = useParams();
  const tour: any = null;

  if (!tour) return null;

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
        <Button variant="cyan" size="action" asChild>
          <Link to={`/tours/${tour.id}/booking`}>
            {t('tour.booking.bookNow')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
