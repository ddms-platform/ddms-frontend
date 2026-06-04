import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeName } from '@/constants/route-name';

export default function Destinations() {
  const { t } = useTranslation();

  const destinations = [
    {
      image:
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=500&fit=crop',
      name: t('home.destinations.hanRiver'),
      tours: 12,
    },
    {
      image:
        'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=500&fit=crop',
      name: t('home.destinations.marbleMountains'),
      tours: 8,
    },
    {
      image:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=500&fit=crop',
      name: t('home.destinations.bachDang'),
      tours: 15,
    },
  ];

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-6 py-16">
      <h2
        className="mb-10 text-[28px] font-bold leading-[1.43]"
        style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
      >
        {t('home.destinations.title')}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((dest) => (
          <Link
            key={dest.name}
            to={routeName.tours}
            className="group relative overflow-hidden rounded-2xl"
            style={{ aspectRatio: '16/10' }}
          >
            <img
              src={dest.image}
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
    </section>
  );
}
