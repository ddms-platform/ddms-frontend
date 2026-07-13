import { useTranslation } from 'react-i18next';
import { Ship } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../../types';
import type {
  TourItemResponse,
  TourServiceResponse,
} from '@/services/tourService';

interface SummaryPanelProps {
  tour: TourItemResponse;
  selectedDate: string;
  selectedTime: string;
  selectedRoom: RoomOption | null;
  selectedSchedule: any;
  guests: number;
  tourPrice: number;
  roomPrice: number;
  servicePrice: number;
  totalPrice: number;
  selectedServices: TourServiceResponse[];
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
  servicePrice,
  totalPrice,
  selectedServices,
}: SummaryPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-3.5 rounded-xl p-4 border border-border"
        style={{ backgroundColor: 'var(--ddms-bg-main)' }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg"
          style={{
            background:
              'linear-gradient(135deg, var(--ddms-secondary), var(--ring))',
          }}
        >
          <Ship size={20} className="text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-foreground leading-tight">{tour.name}</p>
          <p className="text-xs text-ddms-secondary mt-0.5">
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
          borderColor: 'var(--border)',
          backgroundColor: 'var(--ddms-bg-main)',
        }}
      >
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Ngày khởi hành</span>
          <span className="font-semibold text-foreground">
            {formatDateString(selectedDate)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Giờ xuất phát</span>
          <span className="font-semibold text-foreground">{selectedTime}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Số lượng khách</span>
          <span className="font-semibold text-foreground">
            {guests} {t('booking.guests.people', 'người')}
          </span>
        </div>
        {selectedSchedule?.boatName && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Du thuyền vận hành</span>
            <span className="font-semibold text-foreground">
              {selectedSchedule.boatName}
            </span>
          </div>
        )}
        {selectedRoom && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Phòng nghỉ / Hạng ghế</span>
            <span className="font-semibold text-ddms-secondary">
              {selectedRoom.selectedUnitLabel || selectedRoom.name}
            </span>
          </div>
        )}

        <div className="h-px bg-border my-2" />

        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">
            Vé tour ({formatPrice(tour.price)} × {guests})
          </span>
          <span className="font-semibold text-foreground">
            {formatPrice(tourPrice)}
          </span>
        </div>
        {selectedRoom && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Phụ phí phòng/ghế</span>
            <span className="font-semibold text-foreground">
              {formatPrice(roomPrice)}
            </span>
          </div>
        )}
        {selectedServices.length > 0 && (
          <div className="space-y-1">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex justify-between gap-4 text-xs sm:text-sm"
              >
                <span className="text-muted-foreground">{service.name}</span>
                <span className="shrink-0 font-semibold text-foreground">
                  {formatPrice(service.price)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Tổng dịch vụ</span>
              <span className="font-semibold text-foreground">
                {formatPrice(servicePrice)}
              </span>
            </div>
          </div>
        )}

        <div className="h-px bg-border my-2" />

        <div className="flex justify-between items-baseline pt-1">
          <span className="font-bold text-foreground">
            Tổng tiền thanh toán
          </span>
          <span className="text-xl font-black text-ddms-secondary">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
