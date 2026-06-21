import { useTranslation } from 'react-i18next';
import { Ship } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../../types';
import type { TourItemResponse } from '@/services/tourService';

interface SummaryPanelProps {
  tour: TourItemResponse;
  selectedDate: string;
  selectedTime: string;
  selectedRoom: RoomOption | null;
  selectedSchedule: any;
  guests: number;
  tourPrice: number;
  roomPrice: number;
  totalPrice: number;
}

const formatDateString = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const SummaryPanel = ({
  tour,
  selectedDate,
  selectedTime,
  selectedRoom,
  selectedSchedule,
  guests,
  tourPrice,
  roomPrice,
  totalPrice,
}: SummaryPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-3.5 rounded-xl p-4 border border-[rgba(255,255,255,0.06)]"
        style={{ backgroundColor: '#0d1b36' }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #00F0FF, #00b4c0)',
          }}
        >
          <Ship size={20} className="text-[#0A192F]" />
        </div>
        <div>
          <p className="font-bold text-white leading-tight">{tour.name}</p>
          <p className="text-xs text-[#00F0FF] mt-0.5">
            Thời lượng: {Math.floor(tour.durationMinutes / 60)} giờ{' '}
            {tour.durationMinutes % 60 > 0
              ? `${tour.durationMinutes % 60} phút`
              : ''}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border p-4 space-y-3"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          backgroundColor: '#0d1b36',
        }}
      >
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Ngày khởi hành</span>
          <span className="font-semibold text-white">
            {formatDateString(selectedDate)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Giờ xuất phát</span>
          <span className="font-semibold text-white">{selectedTime}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Số lượng khách</span>
          <span className="font-semibold text-white">
            {guests} {t('booking.guests.people', 'người')}
          </span>
        </div>
        {selectedSchedule?.boatName && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Du thuyền vận hành</span>
            <span className="font-semibold text-white">
              {selectedSchedule.boatName}
            </span>
          </div>
        )}
        {selectedRoom && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Phòng nghỉ / Hạng ghế</span>
            <span className="font-semibold text-[#00F0FF]">
              {selectedRoom.name}
            </span>
          </div>
        )}

        <div className="h-px bg-white/6 my-2" />

        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-400">
            Vé tour ({formatPrice(tour.price)} × {guests})
          </span>
          <span className="font-semibold text-white">
            {formatPrice(tourPrice)}
          </span>
        </div>
        {selectedRoom && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Phụ phí phòng/ghế</span>
            <span className="font-semibold text-white">
              {formatPrice(roomPrice)}
            </span>
          </div>
        )}

        <div className="h-px bg-white/6 my-2" />

        <div className="flex justify-between items-baseline pt-1">
          <span className="font-bold text-white">Tổng tiền thanh toán</span>
          <span className="text-xl font-black text-[#00F0FF]">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
