import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../types';

interface StepGuestsProps {
  guests: number;
  maxGuests: number;
  selectedRoom: RoomOption | null;
  tourPrice: number;
  roomPrice: number;
  totalPrice: number;
  onSetGuests: (guests: number) => void;
  basePrice: number;
}

export default function StepGuests({
  guests,
  maxGuests,
  selectedRoom,
  tourPrice,
  roomPrice,
  totalPrice,
  onSetGuests,
  basePrice,
}: StepGuestsProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        {t('booking.guests.title', 'Số lượng khách')}
      </h2>
      <p className="mt-1 text-sm text-gray-400">
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
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') return onSetGuests(1);
            const num = parseInt(val, 10);
            if (!isNaN(num)) onSetGuests(Math.max(1, Math.min(maxGuests, num)));
          }}
          onBlur={() => onSetGuests(Math.max(1, Math.min(maxGuests, guests)))}
          className="w-20 bg-transparent text-center text-3xl font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{
            color: '#ffffff',
            borderBottom: '2px solid rgba(0,240,255,0.4)',
            caretColor: '#00F0FF',
          }}
          aria-label="Number of guests"
        />
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
        style={{
          backgroundColor: '#0d1b36',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            {formatPrice(basePrice)} × {guests}{' '}
            {t('booking.guests.people', 'người')}
          </span>
          <span className="font-semibold text-white">
            {formatPrice(tourPrice)}
          </span>
        </div>
        {selectedRoom && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              {t('booking.summary.room', 'Phòng nghỉ / Hạng ghế')}:{' '}
              {selectedRoom.name}
            </span>
            <span className="font-semibold text-white">
              {formatPrice(roomPrice)}
            </span>
          </div>
        )}
        <div
          className="h-px my-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-white">
            {t('booking.summary.total', 'Tổng cộng')}
          </span>
          <span className="text-xl font-black text-[#00F0FF]">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
