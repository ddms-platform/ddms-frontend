import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface TourReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function TourReviews({ reviews, averageRating, totalReviews }: TourReviewsProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="my-6 h-px" style={{ backgroundColor: '#112240' }} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Star size={20} fill="#ffffff" style={{ color: '#ffffff' }} />
        <h2
          className="text-lg font-semibold"
          style={{ color: '#ffffff', letterSpacing: '-0.18px' }}
        >
          {averageRating} · {totalReviews} {t('tour.reviews.title')}
        </h2>
      </div>

      {/* Review Cards */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl p-5" style={{ backgroundColor: '#112240' }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full"
                style={{ backgroundColor: '#e0e0e0' }}
              >
                <span className="text-sm font-bold" style={{ color: '#ecf0ff' }}>
                  {review.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                  {review.name}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {review.date}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < review.rating ? '#222222' : 'none'}
                    style={{ color: i < review.rating ? '#222222' : 'rgba(255,255,255,0.15)' }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
