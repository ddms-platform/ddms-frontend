import { useTranslation } from 'react-i18next';
import { Ship } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Boat, RoomOption } from '../types';
import { MOCK_TOUR } from '../mock-data';
import { formatDate } from './step-date-time';

interface StepConfirmProps {
  selectedDate: string;
  selectedTime: string;
  selectedBoat: Boat | null;
  selectedRoom: RoomOption | null;
  guests: number;
  tourPrice: number;
  roomPrice: number;
  totalPrice: number;
}

export default function StepConfirm({
  selectedDate,
  selectedTime,
  selectedBoat,
  selectedRoom,
  guests,
  tourPrice,
  roomPrice,
  totalPrice,
}: StepConfirmProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        {t('booking.confirm.title')}
      </h2>
      <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
        {t('booking.confirm.subtitle')}
      </p>

      <div className="mt-6 space-y-4">
        {/* Tour Info */}
        <div
          className="flex items-center gap-4 rounded-xl p-4"
          style={{ backgroundColor: '#112240' }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #00F0FF, #00d4e0)' }}
          >
            <Ship size={22} color="#ffffff" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#ffffff' }}>
              {MOCK_TOUR.title}
            </p>
            <p className="text-sm" style={{ color: '#ecf0ff' }}>
              {MOCK_TOUR.duration}
            </p>
          </div>
        </div>

        {/* Details */}
        <div
          className="space-y-3 rounded-xl border p-4"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>
              {t('booking.summary.date')}
            </span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {formatDate(selectedDate)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>
              {t('booking.summary.time')}
            </span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {selectedTime}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>
              {t('booking.summary.guests')}
            </span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {guests} {t('booking.guests.people')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>
              {t('booking.summary.boat')}
            </span>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              {selectedBoat?.name}
            </span>
          </div>
          {selectedRoom && (
            <div className="flex justify-between text-sm">
              <span style={{ color: '#ecf0ff' }}>
                {t('booking.summary.room')}
              </span>
              <span className="font-medium" style={{ color: '#ffffff' }}>
                {selectedRoom.name}
              </span>
            </div>
          )}

          <div
            className="h-px"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          {/* Price breakdown */}
          <div className="flex justify-between text-sm">
            <span style={{ color: '#ecf0ff' }}>
              {formatPrice(MOCK_TOUR.price)} × {guests}{' '}
              {t('booking.guests.people')}
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

          <div
            className="h-px"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />
          <div className="flex justify-between">
            <span className="font-semibold" style={{ color: '#ffffff' }}>
              {t('booking.summary.total')}
            </span>
            <span className="text-lg font-bold" style={{ color: '#00F0FF' }}>
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
