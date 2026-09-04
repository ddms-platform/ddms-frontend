import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/shared/breadcrumb';
import TourGallery from './components/tour-gallery';
import TourInfo from './components/tour-info';
import TourReviews from './components/tour-reviews';
import BookingSidebar from './components/booking-sidebar';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  tourService,
  type TourItemResponse,
  type TourImageItemResponse,
} from '@/services/tourService';
import WeatherWidget from '@/components/shared/weather-widget';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function TourDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [tour, setTour] = useState<TourItemResponse | null>(null);
  const [images, setImages] = useState<TourImageItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFutureSchedules, setHasFutureSchedules] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Selections for dynamic pricing
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const finalPrice = useMemo(() => {
    if (!tour) return 0;
    let base = tour.price; // Standard price

    // If a class is selected, add its surcharge
    if (selectedClassId) {
      const cls = tour.classes.find((c) => c.id === selectedClassId);
      if (cls && cls.price > 0) base += cls.price;
    }

    // Add selected services
    const servicesCost = selectedServiceIds.reduce((sum, id) => {
      const srv = tour.services.find((s) => s.id === id);
      return sum + (srv?.price || 0);
    }, 0);

    return base + servicesCost;
  }, [tour, selectedClassId, selectedServiceIds]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    if (!id) return;
    const fetchTourData = async () => {
      setLoading(true);
      try {
        const [tourData, imagesData, schedulesData] = await Promise.all([
          tourService.getPublicTourById(id),
          tourService.getTourImages(id).catch(() => []),
          tourService.getTourSchedules(id).catch(() => []),
        ]);

        const now = new Date();
        const futureSchedules = (schedulesData || []).filter(
          (s: any) => new Date(s.start_time) > now,
        );

        setTour(tourData);
        setSelectedClassId(
          (current) => current || tourData.classes?.[0]?.id || '',
        );
        setImages(imagesData);
        setHasFutureSchedules(futureSchedules.length > 0);
      } catch (error) {
        console.error('Failed to fetch tour details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTourData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full animate-pulse text-foreground">
        {/* Gallery Slider Skeleton (Full Bleed) */}
        <Skeleton className="h-screen w-full rounded-none" />

        {/* Content Layout Skeleton */}
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
          {/* Breadcrumb Skeleton */}
          <Skeleton className="h-4 w-64" />

          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* Left Details Skeleton */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>

              {/* Weather + Stats Widget Skeleton */}
              <div className="flex gap-4 p-4 bg-ddms-bg-card border border-border rounded-xl">
                <Skeleton className="h-12 w-24 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>

              {/* Description Paragraphs Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Services/Schedule List Skeletons */}
              <div className="space-y-3 pt-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Right Sidebar Booking Skeleton */}
            <div className="h-112.5 bg-ddms-bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>

                {/* Datepicker/Input skeletons */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>

                {/* Summary values skeleton */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour)
    return (
      <div className="text-center py-20 text-white">Không tìm thấy tour</div>
    );

  const imageUrls =
    images.length > 0
      ? images.map((img) => img.imageUrl)
      : [
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&h=800&fit=crop',
        ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} ${t('tourList.hours', 'giờ')}`;
    return `${mins} ${t('tourList.minutes', 'phút')}`;
  };

  const zoomScale = Math.min(1.15, 1 + scrollY * 0.0003);
  const bookingParams = new URLSearchParams();
  if (selectedClassId) bookingParams.set('classId', selectedClassId);
  if (selectedServiceIds.length > 0) {
    bookingParams.set('services', selectedServiceIds.join(','));
  }
  const bookingQuery = bookingParams.toString();
  const bookingPath = `/tours/${tour.id}/booking${bookingQuery ? `?${bookingQuery}` : ''}`;
  const bookingState = {
    bookingPrefill: {
      classId: selectedClassId,
      serviceIds: selectedServiceIds,
    },
  };
  const normalizeId = (value?: string | null) => value?.trim().toLowerCase();
  const isOwnTour =
    !!normalizeId((user as any)?.id) &&
    normalizeId((user as any)?.id) === normalizeId(tour.createdBy);

  return (
    <div className="w-full bg-ddms-bg-main">
      {/* Scroll Container Spacer */}
      <div className="relative w-full h-[150vh]">
        {/* Sticky Gallery Banner */}
        <div className="sticky top-0 w-full h-screen overflow-hidden bg-black z-0">
          {/* Zooming background image wrapper */}
          <div
            className="w-full h-full transition-transform duration-75 ease-out"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <TourGallery
              images={imageUrls}
              title={tour.name}
              className="w-full h-full rounded-none"
              aspectRatio=""
            />
          </div>

          {/* Gradient Overlay for text contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-black/40 pointer-events-none" />

          {/* Fading Title & Info Overlay */}
          <div
            className="absolute inset-0 flex flex-col items-start justify-end pb-36 px-6 md:px-12 lg:px-24 pointer-events-none select-none"
            style={{ opacity: Math.max(0, 1 - scrollY / 350) }}
          >
            <div
              className="text-left max-w-4xl transition-transform duration-75 ease-out"
              style={{ transform: `translateY(${scrollY * 0.25}px)` }}
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-xl leading-tight">
                {tour.name}
              </h1>
              {tour.location && (
                <p className="mt-3 text-lg sm:text-xl font-medium text-white/90 tracking-wide drop-shadow-lg uppercase">
                  {tour.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.tours'), to: '/tours' },
            { label: tour.name },
          ]}
        />

        {/* Content + Sidebar */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left: Tour Details */}
          <div>
            <TourInfo
              duration={formatDuration(tour.durationMinutes)}
              maxGuests={tour.maxGuests}
              boatName={tour.boatName}
              rating={tour.avgRating}
              reviews={tour.totalReviews}
              description={tour.description || ''}
            />

            {/* Weather Widget for Mobile only */}
            <div className="mt-8 block lg:hidden">
              <WeatherWidget location={tour.location || 'Đà Nẵng'} />
            </div>

            {/* Lộ trình (Itinerary) */}
            {tour.routes && tour.routes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Lộ trình chuyến đi
                </h2>
                <div className="space-y-4">
                  {tour.routes.map((route, idx) => (
                    <div key={route.id} className="relative pl-6">
                      <div className="absolute left-0 top-1 h-full w-px bg-[#34A853]"></div>
                      <div className="absolute -left-1 top-1.5 h-2.5 w-2.5 rounded-full bg-ddms-secondary"></div>
                      <h3 className="font-semibold text-foreground">
                        {idx + 1}. {route.name}
                      </h3>
                      <p className="text-sm text-ddms-secondary mb-1">
                        {route.startPoint} → {route.endPoint}
                      </p>
                      {route.description && (
                        <p className="text-sm text-gray-400">
                          {route.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bản đồ (Map) */}
            {tour.mapUrl && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Bản đồ
                </h2>
                <div className="w-full h-75 rounded-xl overflow-hidden border border-border">
                  <iframe
                    src={tour.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Hạng ghế / Phòng (Classes) */}
            {tour.classes && tour.classes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Hạng ghế / Phòng nghỉ
                </h2>
                <RadioGroup
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                  className="grid gap-4"
                >
                  {tour.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-start space-x-3 p-4 rounded-xl border border-border"
                      style={{ backgroundColor: 'var(--ddms-bg-card)' }}
                    >
                      <RadioGroupItem
                        value={cls.id}
                        id={`class-${cls.id}`}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 flex-1">
                        <Label
                          htmlFor={`class-${cls.id}`}
                          className="text-base font-semibold text-foreground cursor-pointer"
                        >
                          {cls.name}{' '}
                          <span className="text-ddms-secondary ml-2">
                            (
                            {cls.price > 0
                              ? '+' + formatPrice(cls.price)
                              : 'Giá cơ bản'}
                            )
                          </span>
                        </Label>
                        <p className="text-sm text-gray-400">
                          Sức chứa: {cls.capacity} người
                        </p>
                        {cls.description && (
                          <p className="text-sm text-gray-400">
                            {cls.description}
                          </p>
                        )}
                      </div>
                      {cls.imageUrl && (
                        <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 border border-slate-700">
                          <img
                            src={cls.imageUrl}
                            alt={cls.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Dịch vụ đi kèm (Services) */}
            {tour.services && tour.services.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Dịch vụ đi kèm (Tùy chọn)
                </h2>
                <div className="grid gap-4">
                  {tour.services.map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-start space-x-3 p-4 rounded-xl border border-border"
                      style={{ backgroundColor: 'var(--ddms-bg-card)' }}
                    >
                      <Checkbox
                        id={`srv-${srv.id}`}
                        checked={selectedServiceIds.includes(srv.id)}
                        onCheckedChange={() => toggleService(srv.id)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 flex-1">
                        <Label
                          htmlFor={`srv-${srv.id}`}
                          className="text-base font-semibold text-foreground cursor-pointer"
                        >
                          {srv.name}{' '}
                          <span className="text-[#34A853] ml-2">
                            (+{formatPrice(srv.price)})
                          </span>
                        </Label>
                        {srv.description && (
                          <p className="text-sm text-gray-400">
                            {srv.description}
                          </p>
                        )}
                      </div>
                      {srv.imageUrl && (
                        <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-slate-700">
                          <img
                            src={srv.imageUrl}
                            alt={srv.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {tour.faqs && tour.faqs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">
                  Câu hỏi thường gặp
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {tour.faqs.map((faq, idx) => (
                    <AccordionItem key={faq.id} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-left text-foreground hover:text-ddms-secondary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-400">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            <div className="mt-8">
              <TourReviews tourId={tour.id} />
            </div>
          </div>

          {/* Right: Booking Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <BookingSidebar
                tourId={tour.id}
                price={finalPrice}
                isClosed={!hasFutureSchedules}
                createdBy={tour.createdBy}
                selectedClassId={selectedClassId}
                selectedServiceIds={selectedServiceIds}
              />
              <WeatherWidget location={tour.location || 'Đà Nẵng'} />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Book Bar */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t px-6 py-4 lg:hidden"
          style={{
            backgroundColor: 'var(--ddms-bg-main)',
            borderColor: 'var(--border)',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(finalPrice)}
            </span>
            <span className="text-sm text-foreground/80">
              {' '}
              / {t('tour.booking.perPerson')}
            </span>
          </div>
          {!hasFutureSchedules ? (
            <Button variant="secondary" size="action" disabled>
              Tạm đóng
            </Button>
          ) : isOwnTour ? null : (
            <Button variant="cyan" size="action" asChild>
              <Link to={bookingPath} state={bookingState}>
                {t('tour.booking.bookNow')}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
