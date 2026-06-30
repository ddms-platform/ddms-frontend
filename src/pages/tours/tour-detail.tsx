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
import { Loader2 } from 'lucide-react';
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

export default function TourDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [tour, setTour] = useState<TourItemResponse | null>(null);
  const [images, setImages] = useState<TourImageItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFutureSchedules, setHasFutureSchedules] = useState(true);

  // Selections for dynamic pricing
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Automatically select the first class if available
  useEffect(() => {
    if (tour?.classes && tour.classes.length > 0 && !selectedClassId) {
      setSelectedClassId(tour.classes[0].id);
    }
  }, [tour, selectedClassId]);

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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#00F0FF]" />
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.tours'), to: '/tours' },
          { label: tour.name },
        ]}
      />

      {/* Gallery */}
      <TourGallery images={imageUrls} title={tour.name} />

      {/* Content + Sidebar */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: Tour Details */}
        <div>
          <TourInfo
            title={tour.name}
            location={tour.location || 'N/A'}
            duration={formatDuration(tour.durationMinutes)}
            maxGuests={tour.classes?.[0]?.capacity || 0} // Fallback as no maxGuests in response
            boatName={'N/A'} // Fallback as no boatName in response
            rating={tour.avgRating}
            reviews={tour.totalReviews}
            description={tour.description || ''}
          />

          {/* Weather Widget for Mobile only */}
          {tour.location && (
            <div className="mt-8 block lg:hidden">
              <WeatherWidget location={tour.location} />
            </div>
          )}

          {/* Lộ trình (Itinerary) */}
          {tour.routes && tour.routes.length > 0 && (
            <div className="mt-8">
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: '#ffffff' }}
              >
                Lộ trình chuyến đi
              </h2>
              <div className="space-y-4">
                {tour.routes.map((route, idx) => (
                  <div key={route.id} className="relative pl-6">
                    <div className="absolute left-0 top-1 h-full w-px bg-[#34A853]"></div>
                    <div className="absolute -left-1 top-1.5 h-2.5 w-2.5 rounded-full bg-[#00F0FF]"></div>
                    <h3 className="font-semibold text-[#ecf0ff]">
                      {idx + 1}. {route.name}
                    </h3>
                    <p className="text-sm text-[#00F0FF] mb-1">
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
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: '#ffffff' }}
              >
                Bản đồ
              </h2>
              <div className="w-full h-75 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
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
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: '#ffffff' }}
              >
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
                    className="flex items-start space-x-3 p-4 rounded-xl border border-[rgba(255,255,255,0.1)]"
                    style={{ backgroundColor: '#112240' }}
                  >
                    <RadioGroupItem
                      value={cls.id}
                      id={`class-${cls.id}`}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 flex-1">
                      <Label
                        htmlFor={`class-${cls.id}`}
                        className="text-base font-semibold text-[#ffffff] cursor-pointer"
                      >
                        {cls.name}{' '}
                        <span className="text-[#00F0FF] ml-2">
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
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: '#ffffff' }}
              >
                Dịch vụ đi kèm (Tùy chọn)
              </h2>
              <div className="grid gap-4">
                {tour.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-start space-x-3 p-4 rounded-xl border border-[rgba(255,255,255,0.1)]"
                    style={{ backgroundColor: '#112240' }}
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
                        className="text-base font-semibold text-[#ffffff] cursor-pointer"
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
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: '#ffffff' }}
              >
                Câu hỏi thường gặp
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {tour.faqs.map((faq, idx) => (
                  <AccordionItem key={faq.id} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-left text-[#ecf0ff] hover:text-[#00F0FF]">
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
            <TourReviews
              reviews={[]} // Mock empty reviews for now
              averageRating={tour.avgRating}
              totalReviews={tour.totalReviews}
            />
          </div>
        </div>

        {/* Right: Booking Sidebar */}
        <div className="hidden lg:block space-y-6">
          <BookingSidebar
            tourId={tour.id}
            price={finalPrice}
            isClosed={!hasFutureSchedules}
          />
          {tour.location && <WeatherWidget location={tour.location} />}
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
            {formatPrice(finalPrice)}
          </span>
          <span className="text-sm" style={{ color: '#ecf0ff' }}>
            {' '}
            / {t('tour.booking.perPerson')}
          </span>
        </div>
        {!hasFutureSchedules ? (
          <Button variant="secondary" size="action" disabled>
            Tạm đóng
          </Button>
        ) : (
          <Button variant="cyan" size="action" asChild>
            <Link to={`/tours/${tour.id}/booking`}>
              {t('tour.booking.bookNow')}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
