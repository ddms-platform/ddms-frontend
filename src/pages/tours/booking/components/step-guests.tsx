import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../types';
import type { TourServiceResponse } from '@/services/tourService';

interface StepGuestsProps {
  guests: number;
  maxGuests: number;
  selectedRoom: RoomOption | null;
  tourPrice: number;
  roomPrice: number;
  servicePrice: number;
  totalPrice: number;
  selectedServices: TourServiceResponse[];
  onSetGuests: (guests: number) => void;
  basePrice: number;
}

export default function StepGuests({
  guests,
  maxGuests,
  selectedRoom,
  tourPrice,
  roomPrice,
  servicePrice,
  totalPrice,
  selectedServices,
  onSetGuests,
  basePrice,
}: StepGuestsProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {t('booking.guests.title', 'Số lượng khách')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('booking.guests.subtitle', { max: maxGuests })}
        {selectedRoom && (
          <span className="ml-1 text-ddms-secondary">
            — {selectedRoom.name}
          </span>
        )}
      </p>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => onSetGuests(Math.max(1, guests - 1))}
          disabled={guests <= 1}
          aria-label="Decrease guests"
          className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30 border-border text-foreground hover:bg-muted"
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
            color: 'var(--foreground)',
            borderBottom: '2px solid var(--ddms-secondary)',
            caretColor: 'var(--ddms-secondary)',
          }}
          aria-label="Number of guests"
        />
        <button
          onClick={() => onSetGuests(Math.min(maxGuests, guests + 1))}
          disabled={guests >= maxGuests}
          aria-label="Increase guests"
          className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30 border-border text-foreground hover:bg-muted"
        >
          +
        </button>
      </div>

      {/* Price Breakdown */}
      <div
        className="mx-auto mt-8 max-w-sm space-y-2 rounded-xl p-4"
        style={{
          backgroundColor: 'var(--ddms-bg-main)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {formatPrice(basePrice)} × {guests}{' '}
            {t('booking.guests.people', 'người')}
          </span>
          <span className="font-semibold text-foreground">
            {formatPrice(tourPrice)}
          </span>
        </div>
        {selectedRoom && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('booking.summary.room', 'Phòng nghỉ / Hạng ghế')}:{' '}
              {selectedRoom.name}
            </span>
            <span className="font-semibold text-foreground">
              {formatPrice(roomPrice)}
            </span>
          </div>
        )}
        {selectedServices.length > 0 && (
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Dịch vụ:{' '}
              {selectedServices.map((service) => service.name).join(', ')}
            </span>
            <span className="shrink-0 font-semibold text-foreground">
              {formatPrice(servicePrice)}
            </span>
          </div>
        )}
        <div
          className="h-px my-2"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-foreground">
            {t('booking.summary.total', 'Tổng cộng')}
          </span>
          <span className="text-xl font-black text-ddms-secondary">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
