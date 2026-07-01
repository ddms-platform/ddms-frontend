import { useTranslation } from 'react-i18next';
import { Check, Info, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../../types';

interface RoomCardProps {
  room: RoomOption;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetail: () => void;
}

const RoomCard = ({
  room,
  isSelected,
  onToggle,
  onViewDetail,
}: RoomCardProps) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      className="group relative w-full overflow-hidden rounded-xl border text-left transition-all hover:shadow-lg active:scale-[0.99]"
      style={{
        borderColor: isSelected ? '#00F0FF' : 'rgba(255,255,255,0.1)',
        backgroundColor: isSelected ? 'rgba(0,240,255,0.06)' : '#0d1b36',
      }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 w-full sm:h-auto sm:w-52 shrink-0 overflow-hidden">
          <img
            src={room.images[0]}
            alt={room.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-semibold"
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
          </div>
          <div
            className="absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor:
                room.availableRooms > 0
                  ? 'rgba(16,185,129,0.9)'
                  : 'rgba(239,68,68,0.9)',
              color: '#fff',
            }}
          >
            {room.availableRooms}/{room.totalRooms} {t('rooms.available')}
          </div>
          {isSelected && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,240,255,0.15)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: '#00F0FF' }}
              >
                <Check size={20} style={{ color: '#112240' }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold" style={{ color: '#ffffff' }}>
                {room.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                <Star size={12} fill="#FFD700" style={{ color: '#FFD700' }} />
                <span
                  className="text-xs font-semibold"
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
              <p className="text-lg font-bold" style={{ color: '#00F0FF' }}>
                {formatPrice(room.price)}
              </p>
              <p className="text-[10px]" style={{ color: '#ecf0ff' }}>
                / {t('rooms.perNight')}
              </p>
            </div>
          </div>

          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: '#ecf0ff' }}
          >
            {room.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
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
            ].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: '#ecf0ff',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map(({ icon: AIcon, label }, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-[10px]"
                style={{ color: '#ecf0ff' }}
              >
                <AIcon size={12} style={{ color: '#00F0FF' }} />
                {label}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span
                className="text-[10px] font-medium"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                +{room.amenities.length - 4}
              </span>
            )}
          </div>

          <div
            className="mt-3 border-t pt-3"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-all hover:underline cursor-pointer"
              style={{ color: '#00F0FF' }}
            >
              <Info size={12} />
              {t('booking.rooms.viewDetail')}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default RoomCard;
