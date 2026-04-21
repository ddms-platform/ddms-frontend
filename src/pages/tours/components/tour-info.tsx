import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users, Ship, Star } from 'lucide-react';

interface TourInfoProps {
  title: string;
  location: string;
  duration: string;
  maxGuests: number;
  boatName: string;
  rating: number;
  reviews: number;
  description: string;
}

export default function TourInfo({
  title,
  location,
  duration,
  maxGuests,
  boatName,
  rating,
  reviews,
  description,
}: TourInfoProps) {
  const { t } = useTranslation();

  const details = [
    { icon: Clock, label: t('tour.info.duration'), value: duration },
    {
      icon: Users,
      label: t('tour.info.maxGuests'),
      value: `${maxGuests} ${t('tour.info.people')}`,
    },
    { icon: Ship, label: t('tour.info.boat'), value: boatName },
  ];

  return (
    <div>
      {/* Title & Rating */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            {title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: '#6a6a6a' }}>
            <MapPin size={15} />
            {location}
          </p>
        </div>
        <div
          className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2"
          style={{
            backgroundColor: '#f7f7f7',
          }}
        >
          <Star size={16} fill="#222222" style={{ color: '#222222' }} />
          <span className="text-base font-bold" style={{ color: '#222222' }}>
            {rating}
          </span>
          <span className="text-sm" style={{ color: '#6a6a6a' }}>
            ({reviews})
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 h-px" style={{ backgroundColor: '#f2f2f2' }} />

      {/* Quick Details */}
      <div className="grid grid-cols-3 gap-4">
        {details.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl p-4 text-center"
            style={{ backgroundColor: '#f7f7f7' }}
          >
            <Icon size={22} style={{ color: '#ff385c' }} />
            <span className="mt-2 text-xs font-medium" style={{ color: '#6a6a6a' }}>
              {label}
            </span>
            <span className="mt-0.5 text-sm font-semibold" style={{ color: '#222222' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-6 h-px" style={{ backgroundColor: '#f2f2f2' }} />

      {/* Description */}
      <div>
        <h2
          className="text-lg font-semibold"
          style={{ color: '#222222', letterSpacing: '-0.18px' }}
        >
          {t('tour.info.about')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6a6a6a' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
