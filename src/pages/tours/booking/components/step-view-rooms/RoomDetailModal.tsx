import { useTranslation } from 'react-i18next';
import { Star, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import ImageCarousel from '@/components/shared/image-carousel';
import { Button } from '@/components/ui/button';
import type { RoomOption } from '../../types';

interface RoomDetailModalProps {
  room: RoomOption;
  onClose: () => void;
  onSelect: (room: RoomOption) => void;
  isSelected: boolean;
}

const RoomDetailModal = ({
  room,
  onClose,
  onSelect,
  isSelected,
}: RoomDetailModalProps) => {
  const { t } = useTranslation();
  const totalReviews = room.ratingBreakdown.reduce((s, r) => s + r.count, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl"
        style={{
          backgroundColor: '#0d1b36',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff' }}
        >
          <X size={16} />
        </button>

        <ImageCarousel
          images={room.images}
          aspectRatio="16/9"
          getAltText={(i) => `${room.name} - ${i + 1}`}
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                  {room.name}
                </h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor:
                      room.type === 'vip'
                        ? 'rgba(255,215,0,0.9)'
                        : room.type === 'deluxe'
                          ? 'rgba(0,240,255,0.9)'
                          : 'rgba(255,255,255,0.85)',
                    color: '#0A192F',
                  }}
                >
                  {room.type === 'vip'
                    ? 'VIP'
                    : room.type === 'deluxe'
                      ? 'Deluxe'
                      : 'Standard'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Star size={14} fill="#FFD700" style={{ color: '#FFD700' }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#FFD700' }}
                >
                  {room.rating}
                </span>
                <span className="text-xs" style={{ color: '#ecf0ff' }}>
                  ({room.reviewCount} {t('rooms.reviews')})
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: '#00F0FF' }}>
                {formatPrice(room.price)}
              </p>
              <p className="text-xs" style={{ color: '#ecf0ff' }}>
                / {t('rooms.perNight')}
              </p>
            </div>
          </div>

          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: '#ecf0ff' }}
          >
            {room.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: room.area, icon: '📐' },
              { label: room.bed, icon: '🛏️' },
              { label: `${room.maxAdults} ${t('rooms.adults')}`, icon: '👤' },
              ...(room.maxChildren > 0
                ? [
                    {
                      label: `${room.maxChildren} ${t('rooms.children')}`,
                      icon: '👶',
                    },
                  ]
                : []),
              {
                label: `${room.availableRooms}/${room.totalRooms} ${t('rooms.available')}`,
                icon: '🚪',
              },
            ].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: '#ecf0ff',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
            {t('booking.rooms.amenitiesLabel')}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {room.amenities.map(({ icon: AIcon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <AIcon size={16} style={{ color: '#00F0FF' }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: '#ecf0ff' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
            {t('booking.rooms.ratingOverview')}
          </h3>
          <div className="mt-3 flex items-start gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: '#FFD700' }}>
                {room.rating}
              </p>
              <div className="mt-1 flex items-center justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    fill={
                      s <= Math.round(room.rating) ? '#FFD700' : 'transparent'
                    }
                    style={{
                      color:
                        s <= Math.round(room.rating)
                          ? '#FFD700'
                          : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px]" style={{ color: '#ecf0ff' }}>
                {totalReviews} {t('rooms.reviews')}
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const item = room.ratingBreakdown.find(
                  (r) => r.stars === stars,
                );
                const count = item?.count || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span
                      className="flex w-6 items-center gap-0.5 text-[10px] font-medium"
                      style={{ color: '#ecf0ff' }}
                    >
                      {stars}
                      <Star
                        size={8}
                        fill="#FFD700"
                        style={{ color: '#FFD700' }}
                      />
                    </span>
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: '#FFD700' }}
                      />
                    </div>
                    <span
                      className="w-7 text-right text-[10px]"
                      style={{ color: '#ecf0ff' }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
            {t('booking.rooms.reviewsLabel')} ({room.reviews.length})
          </h3>
          <div className="mt-3 space-y-3">
            {room.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl p-3.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                        color: '#0A192F',
                      }}
                    >
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: '#ffffff' }}
                      >
                        {rev.name}
                      </span>
                      <p
                        className="text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        {rev.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        fill={s <= rev.rating ? '#FFD700' : 'transparent'}
                        style={{
                          color:
                            s <= rev.rating
                              ? '#FFD700'
                              : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: '#ecf0ff' }}
                >
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="dark-outline"
              size="action"
              className="flex-1"
              onClick={onClose}
            >
              {t('booking.rooms.closeModal')}
            </Button>
            <Button
              variant="cyan"
              size="action"
              className="flex-1"
              onClick={() => {
                onSelect(room);
                onClose();
              }}
              style={
                isSelected
                  ? {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                    }
                  : undefined
              }
            >
              {isSelected
                ? t('booking.rooms.unselectRoom')
                : t('booking.rooms.selectRoom')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
