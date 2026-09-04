import { useTranslation } from 'react-i18next';
import { Clock, Users, Ship, Star } from 'lucide-react';

interface TourInfoProps {
  duration: string;
  /** Null khi chủ thuyền chưa khai số khách tối đa cho tour. */
  maxGuests?: number | null;
  /** Null khi tour chưa gắn lịch trình nào nên chưa biết chạy thuyền nào. */
  boatName?: string | null;
  rating: number;
  reviews: number;
  description: string;
}

export default function TourInfo({
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
      value: maxGuests ? `${maxGuests} ${t('tour.info.people')}` : '—',
    },
    { icon: Ship, label: t('tour.info.boat'), value: boatName || '—' },
  ];

  return (
    <div>
      {/* Rating Badge */}
      <div className="flex items-center gap-2 mb-6">
        <Star size={18} fill="#ffc107" style={{ color: '#ffc107' }} />
        <span className="text-lg font-bold text-foreground">{rating}</span>
        <span className="text-sm text-foreground/75">
          ({reviews} {t('tour.reviewsCount', 'đánh giá')})
        </span>
      </div>

      {/* Quick Details */}
      <div className="grid grid-cols-3 gap-4">
        {details.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl p-4 text-center border"
            style={{
              backgroundColor: 'var(--ddms-bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <Icon size={22} className="text-ddms-secondary" />
            <span className="mt-2 text-xs font-medium text-foreground/75">
              {label}
            </span>
            <span className="mt-0.5 text-sm font-semibold text-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-6 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Description */}
      <div>
        <h2
          className="text-lg font-semibold text-foreground"
          style={{ letterSpacing: '-0.18px' }}
        >
          {t('tour.info.about')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {description}
        </p>
      </div>
    </div>
  );
}
