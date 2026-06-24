import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import {
  tourService,
  type PopularDestinationResponse,
} from '@/services/tourService';

export default function Destinations() {
  const { t } = useTranslation();

  const [destinations, setDestinations] = useState<
    PopularDestinationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await tourService.getPopularDestinations(3);
        setDestinations(data || []);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-6 py-16">
      <h2
        className="mb-10 text-[28px] font-bold leading-[1.43]"
        style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
      >
        {t('home.destinations.title')}
      </h2>
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#00F0FF]" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              to={`${routeName.tours}?location=${encodeURIComponent(dest.name)}`}
              className="group relative overflow-hidden rounded-2xl"
              style={{ aspectRatio: '16/10' }}
            >
              <img
                src={
                  dest.imageUrl ||
                  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=500&fit=crop'
                }
                alt={dest.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                }}
              />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                  {dest.name}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  {dest.tours} {t('home.destinations.toursAvailable')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
