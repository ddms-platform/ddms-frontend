import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import {
  tourService,
  type PopularDestinationResponse,
} from '@/services/tourService';
import useLanguage from '@/contexts/LanguageContext';

export default function Destinations() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [destinations, setDestinations] = useState<
    PopularDestinationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await tourService.getPopularDestinations(4);
        setDestinations((data || []).slice(0, 4));
      } catch (error) {
        // Chưa có điểm đến nào thì để trống. Trước đây chỗ này luôn chèn thêm
        // điểm đến giả cho đủ 4 ô, kèm số tour bịa.
        console.error('Failed to fetch destinations:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [language]);

  // Layout classes for staggered grid mapping
  const gridClasses = [
    'md:col-span-3', // Card 1 (Large landscape)
    'md:col-span-2', // Card 2 (Narrow)
    'md:col-span-2', // Card 3 (Narrow)
    'md:col-span-3', // Card 4 (Large landscape)
  ];

  return (
    <section
      id="destinations"
      className="mx-auto max-w-7xl px-6 py-20 bg-transparent"
    >
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-bold leading-tight text-foreground tracking-tight">
            {language === 'EN' ? 'Top Destinations' : 'Điểm đến nổi bật'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === 'EN'
              ? 'Explore beautiful waterways and marine habitats across Da Nang'
              : 'Khám phá các tuyến điểm đường thủy và hệ sinh thái biển tuyệt đẹp tại Đà Nẵng'}
          </p>
        </div>

        <Link
          to={routeName.tours}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary transition-all shrink-0 pb-1"
        >
          <span>
            {language === 'EN' ? 'Explore all destinations' : 'Xem tất cả'}
          </span>
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

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-ddms-secondary" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-center">
          <MapPin size={24} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t('home.destinations.empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {destinations.map((dest, idx) => {
            const gridClass = gridClasses[idx % 4];
            return (
              <Link
                key={dest.name}
                to={`${routeName.tours}?location=${encodeURIComponent(dest.name)}`}
                className={`${gridClass} group relative rounded-[24px] overflow-hidden border border-white/10 h-[280px] sm:h-[320px] transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card`}
              >
                <img
                  src={
                    dest.imageUrl ||
                    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=500&fit=crop'
                  }
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                    {dest.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/70 font-light">
                    {dest.tours} {t('home.destinations.toursAvailable')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
