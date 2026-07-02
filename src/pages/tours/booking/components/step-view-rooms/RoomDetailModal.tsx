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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-ddms-bg-card shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 cursor-default"
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
                <h2 className="text-xl font-bold text-foreground">
                  {room.name}
                </h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor:
                      room.type === 'vip'
                        ? 'rgba(255,215,0,0.9)'
                        : room.type === 'deluxe'
                          ? 'rgba(0,119,182,0.9)'
                          : 'rgba(255,255,255,0.85)',
                    color: room.type === 'standard' ? '#0a2540' : '#ffffff',
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
                <span className="text-xs text-muted-foreground">
                  ({room.reviewCount} {t('rooms.reviews')})
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-ddms-secondary">
                {formatPrice(room.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                / {t('rooms.perNight')}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
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
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-muted text-foreground border border-border"
              >
                <span>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <h3 className="text-sm font-semibold text-foreground">
            {t('booking.rooms.amenitiesLabel')}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {room.amenities.map(({ icon: AIcon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-muted border border-border"
              >
                <AIcon size={16} className="text-ddms-secondary" />
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <h3 className="text-sm font-semibold text-foreground">
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
                          : 'var(--border)',
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
                    <span className="flex w-6 items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                      {stars}
                      <Star
                        size={8}
                        fill="#FFD700"
                        style={{ color: '#FFD700' }}
                      />
                    </span>
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--border)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: '#FFD700' }}
                      />
                    </div>
                    <span className="w-7 text-right text-[10px] text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="my-5 h-px"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <h3 className="text-sm font-semibold text-foreground">
            {t('booking.rooms.reviewsLabel')} ({room.reviews.length})
          </h3>
          <div className="mt-3 space-y-3">
            {room.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl p-3.5 bg-muted border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--ddms-secondary), var(--ring))',
                        color: 'var(--primary-foreground)',
                      }}
                    >
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {rev.name}
                      </span>
                      <p className="text-[10px] text-muted-foreground/60">
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
                          color: s <= rev.rating ? '#FFD700' : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              size="action"
              className="flex-1 text-foreground border-foreground/30 hover:bg-foreground/5"
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
                      backgroundColor: 'var(--border)',
                      color: 'var(--foreground)',
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
