import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../types';
import { MOCK_TOUR } from '../mock-data';

interface StepGuestsProps {
  guests: number;
  maxGuests: number;
  selectedRoom: RoomOption | null;
  tourPrice: number;
  roomPrice: number;
  totalPrice: number;
  onSetGuests: (guests: number) => void;
}

export default function StepGuests({
  guests,
  maxGuests,
  selectedRoom,
  tourPrice,
  roomPrice,
  totalPrice,
  onSetGuests,
}: StepGuestsProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        {t('booking.guests.title')}
      </h2>
      <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
        {t('booking.guests.subtitle', { max: maxGuests })}
        {selectedRoom && (
          <span className="ml-1" style={{ color: '#00F0FF' }}>
            — {selectedRoom.name}
          </span>
        )}
      </p>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => onSetGuests(Math.max(1, guests - 1))}
          disabled={guests <= 1}
          aria-label="Decrease guests"
          className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          −
        </button>
        <span className="w-16 text-center text-3xl font-bold" style={{ color: '#ffffff' }}>
          {guests}
        </span>
        <button
          onClick={() => onSetGuests(Math.min(maxGuests, guests + 1))}
          disabled={guests >= maxGuests}
          aria-label="Increase guests"
          className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          +
        </button>
      </div>

      {/* Price Breakdown */}
      <div
        className="mx-auto mt-8 max-w-sm space-y-2 rounded-xl p-4"
        style={{ backgroundColor: '#112240' }}
      >
        <div className="flex justify-between text-sm">
          <span style={{ color: '#ecf0ff' }}>
            {formatPrice(MOCK_TOUR.price)} × {guests} {t('booking.guests.people')}
          </span>
          <span className="font-medium" style={{ color: '#ffffff' }}>
            {formatPrice(tourPrice)}
          </span>
        </div>
        {selectedRoom && (
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>
              {t('booking.summary.room')}: {selectedRoom.name}
            </span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {formatPrice(roomPrice)}
            </span>
          </div>
        )}
        <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div className="flex justify-between">
          <span className="font-semibold" style={{ color: '#ffffff' }}>
            {t('booking.summary.total')}
          </span>
          <span className="font-bold" style={{ color: '#00F0FF' }}>
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
