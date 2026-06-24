import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Ship,
  Anchor,
  MapPin,
  Star,
  ChevronRight,
  Gauge,
  Shield,
  Waves,
  Calendar,
  ArrowLeft,
  DoorOpen,
} from 'lucide-react';
import Breadcrumb from '@/components/shared/breadcrumb';
import { StatusBadge } from '@/components/badges';
import ImageCarousel from '@/components/shared/image-carousel';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import { boatService, type Boat } from '@/services/boatService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface BoatSpec {
  icon: React.ElementType;
  label: string;
  value: string;
}

export default function BoatDetailPage() {
  const { t } = useTranslation();
  const { boatId } = useParams();

  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boatId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    boatService
      .getByIdPublic(boatId)
      .then((data) => setBoat(data))
      .catch((err) => console.error('Failed to load boat:', err))
      .finally(() => setLoading(false));
  }, [boatId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!boat) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
        >
          <Ship size={40} style={{ color: '#EF4444' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
          {t('boatDetail.notFound')}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#ecf0ff' }}>
          {t('boatDetail.notFoundDesc')}
        </p>
        <Button variant="cyan" size="action" className="mt-6 gap-2" asChild>
          <Link to={routeName.tours}>
            <ArrowLeft size={16} />
            {t('boatDetail.backToTours')}
          </Link>
        </Button>
      </div>
    );
  }

  const boatTypeLabel =
    boat.type === 'cruise'
      ? t('booking.boat.types.cruise')
      : boat.type === 'luxury'
        ? t('booking.boat.types.luxury')
        : boat.type === 'party'
          ? t('booking.boat.types.party')
          : boat.type === 'speedboat'
            ? t('booking.boat.types.speedboat')
            : t('booking.boat.types.standard');

  const specs: BoatSpec[] = [
    {
      icon: Users,
      label: t('boatDetail.specs.capacity'),
      value: `${boat.maxPassengers} ${t('booking.guests.people')}`,
    },
    { icon: Gauge, label: t('boatDetail.specs.speed'), value: 'N/A' },
    { icon: Anchor, label: t('boatDetail.specs.length'), value: 'N/A' },
    {
      icon: Calendar,
      label: t('boatDetail.specs.yearBuilt'),
      value: new Date(boat.createdAt).getFullYear().toString(),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.tours'), to: '/tours' },
          { label: boat.name },
        ]}
      />

      {/* Hero Gallery */}
      {boat.images && boat.images.length > 0 && (
        <div className="mt-4">
          <ImageCarousel
            images={boat.images.map((img) => img.imageUrl)}
            getAltText={(i) =>
              `${boat.name} - ${t('tour.gallery.photo')} ${i + 1}`
            }
          />
        </div>
      )}

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[28px] font-bold"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              {boat.name}
            </h1>
            {boat.type && (
              <span
                className="rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(0,240,255,0.12)',
                  color: '#00F0FF',
                }}
              >
                {boatTypeLabel}
              </span>
            )}
          </div>
          <p
            className="mt-2 flex items-center gap-1.5 text-sm"
            style={{ color: '#ecf0ff' }}
          >
            <MapPin size={15} />
            Bến Bạch Đằng, Đà Nẵng
          </p>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge
            label={
              boat.status === 'running'
                ? t('booking.boat.available')
                : t('booking.boat.unavailable')
            }
            variant={boat.status === 'running' ? 'available' : 'unavailable'}
          />
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ backgroundColor: '#112240' }}
          >
            <Star size={16} fill="#FFD700" style={{ color: '#FFD700' }} />
            <span className="text-base font-bold" style={{ color: '#ffffff' }}>
              5.0
            </span>
            <span className="text-xs" style={{ color: '#ecf0ff' }}>
              (0 {t('boatDetail.trips')})
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="my-6 h-px"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      />

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {specs.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#112240' }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05))',
              }}
            >
              <Icon size={20} style={{ color: '#00F0FF' }} />
            </div>
            <span
              className="mt-2.5 text-xs font-medium"
              style={{ color: '#ecf0ff' }}
            >
              {label}
            </span>
            <span
              className="mt-0.5 text-sm font-bold"
              style={{ color: '#ffffff' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Description */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#112240' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {t('boatDetail.about')}
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: '#ecf0ff' }}
            >
              Thuyền {boat.name} cung cấp trải nghiệm tuyệt vời. Sức chứa tối đa
              lên đến {boat.maxPassengers} khách.
            </p>
          </div>

          {/* Amenities (Services) */}
          {boat.services && boat.services.length > 0 && (
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: '#112240' }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: '#ffffff' }}
              >
                {t('boatDetail.amenities')}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {boat.services
                  .filter((s) => s.isActive)
                  .map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: 'rgba(0,240,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="text-lg">⭐</span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: '#ffffff' }}
                      >
                        {service.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Captain Card */}
          <div
            className="sticky top-24 space-y-6 rounded-2xl p-6"
            style={{
              backgroundColor: '#112240',
              boxShadow:
                'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            {/* Captain */}
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: '#ecf0ff' }}
              >
                {t('boatDetail.captain')}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                    color: '#0A192F',
                  }}
                >
                  C
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#ffffff' }}>
                    Captain
                  </p>
                  <p className="text-xs" style={{ color: '#ecf0ff' }}>
                    N/A
                  </p>
                </div>
              </div>
            </div>

            <div
              className="h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />

            {/* Safety */}
            <div
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ backgroundColor: 'rgba(52,211,153,0.08)' }}
            >
              <Shield size={20} style={{ color: '#34D399' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#34D399' }}>
                  {t('boatDetail.safety')}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {t('boatDetail.safetyDesc')}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
              >
                <Waves
                  size={18}
                  className="mx-auto"
                  style={{ color: '#00F0FF' }}
                />
                <p
                  className="mt-1 text-lg font-bold"
                  style={{ color: '#ffffff' }}
                >
                  0
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {t('boatDetail.totalTrips')}
                </p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
              >
                <Star
                  size={18}
                  className="mx-auto"
                  fill="#FFD700"
                  style={{ color: '#FFD700' }}
                />
                <p
                  className="mt-1 text-lg font-bold"
                  style={{ color: '#ffffff' }}
                >
                  5.0
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {t('boatDetail.rating')}
                </p>
              </div>
            </div>

            <div
              className="h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />

            {/* CTA */}
            {boat.status === 'running' ? (
              <div className="space-y-3">
                <Button
                  variant="cyan"
                  size="action-lg"
                  className="w-full gap-2"
                  asChild
                >
                  <Link to={`/boats/${boat.id}/rooms`}>
                    <DoorOpen size={16} />
                    {t('boatDetail.viewRooms')}
                  </Link>
                </Button>
                <Button
                  variant="dark-outline"
                  size="action-lg"
                  className="w-full gap-2"
                  asChild
                >
                  <Link to={routeName.tours}>
                    {t('boatDetail.bookWithBoat')}
                    <ChevronRight size={16} />
                  </Link>
                </Button>
              </div>
            ) : (
              <div
                className="rounded-lg py-3.5 text-center text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#ecf0ff',
                }}
              >
                {t('boatDetail.currentlyUnavailable')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
