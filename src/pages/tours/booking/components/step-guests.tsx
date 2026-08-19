import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../types';
import type { TourServiceResponse } from '@/services/tourService';

/** Thành phần đoàn khách. Tổng ba hạng chính là số người trên tàu. */
export interface PartyState {
  adults: number;
  children: number;
  infants: number;
}

interface StepGuestsProps {
  party: PartyState;
  /** Tổng số khách, bằng adults + children + infants. */
  guests: number;
  maxGuests: number;
  selectedRoom: RoomOption | null;
  tourPrice: number;
  roomPrice: number;
  servicePrice: number;
  totalPrice: number;
  selectedServices: TourServiceResponse[];
  onSetParty: (party: PartyState) => void;
  basePrice: number;
  /** % giá tour trẻ 5–11 tuổi phải trả. */
  childPricePercent: number;
  /** % giá tour trẻ dưới 5 tuổi phải trả. */
  infantPricePercent: number;
}

/** Làm tròn từng dòng đúng như server, để số khách nhìn thấy khớp số bị trừ tiền. */
const lineTotal = (basePrice: number, count: number, percent: number) =>
  Math.round((basePrice * count * percent) / 100);

interface TierRowProps {
  label: string;
  hint: string;
  unitPrice: number;
  count: number;
  canAdd: boolean;
  onChange: (next: number) => void;
}

function TierRow({
  label,
  hint,
  unitPrice,
  count,
  canAdd,
  onChange,
}: TierRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {hint} · {unitPrice > 0 ? formatPrice(unitPrice) : 'Miễn phí'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count <= 0}
          aria-label={`Bớt ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30 border-border text-foreground hover:bg-muted"
        >
          −
        </button>
        <span className="w-8 text-center text-xl font-bold text-foreground">
          {count}
        </span>
        <button
          type="button"
          onClick={() => onChange(count + 1)}
          disabled={!canAdd}
          aria-label={`Thêm ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30 border-border text-foreground hover:bg-muted"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function StepGuests({
  party,
  guests,
  maxGuests,
  selectedRoom,
  tourPrice,
  roomPrice,
  servicePrice,
  totalPrice,
  selectedServices,
  onSetParty,
  basePrice,
  childPricePercent,
  infantPricePercent,
}: StepGuestsProps) {
  const { t } = useTranslation();

  // Còn chỗ mới cho thêm. Em bé cũng chiếm chỗ — trên tàu vẫn là một người.
  const canAdd = guests < maxGuests;

  const adultTotal = lineTotal(basePrice, party.adults, 100);
  const childTotal = lineTotal(basePrice, party.children, childPricePercent);
  const infantTotal = lineTotal(basePrice, party.infants, infantPricePercent);

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

      <div
        className="mt-6 divide-y rounded-xl px-4"
        style={{
          backgroundColor: 'var(--ddms-bg-main)',
          border: '1px solid var(--border)',
          borderColor: 'var(--border)',
        }}
      >
        <TierRow
          label="Người lớn"
          hint="Từ 12 tuổi"
          unitPrice={basePrice}
          count={party.adults}
          canAdd={canAdd}
          onChange={(adults) => onSetParty({ ...party, adults })}
        />
        <TierRow
          label="Trẻ em"
          hint="5–11 tuổi"
          unitPrice={Math.round((basePrice * childPricePercent) / 100)}
          count={party.children}
          canAdd={canAdd}
          onChange={(children) => onSetParty({ ...party, children })}
        />
        <TierRow
          label="Em bé"
          hint="Dưới 5 tuổi"
          unitPrice={Math.round((basePrice * infantPricePercent) / 100)}
          count={party.infants}
          canAdd={canAdd}
          onChange={(infants) => onSetParty({ ...party, infants })}
        />
      </div>

      {guests === 0 && (
        <p className="mt-3 text-center text-sm font-semibold text-amber-600 dark:text-amber-400">
          Vui lòng chọn ít nhất một khách.
        </p>
      )}
      {!canAdd && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Chuyến này chỉ còn {maxGuests} chỗ — em bé cũng tính là một chỗ.
        </p>
      )}

      {/* Price Breakdown */}
      <div
        className="mx-auto mt-8 max-w-sm space-y-2 rounded-xl p-4"
        style={{
          backgroundColor: 'var(--ddms-bg-main)',
          border: '1px solid var(--border)',
        }}
      >
        {party.adults > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Người lớn × {party.adults}
            </span>
            <span className="font-semibold text-foreground">
              {formatPrice(adultTotal)}
            </span>
          </div>
        )}
        {party.children > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Trẻ em × {party.children} ({childPricePercent}%)
            </span>
            <span className="font-semibold text-foreground">
              {formatPrice(childTotal)}
            </span>
          </div>
        )}
        {party.infants > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Em bé × {party.infants} ({infantPricePercent}%)
            </span>
            <span className="font-semibold text-foreground">
              {formatPrice(infantTotal)}
            </span>
          </div>
        )}
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
        <p className="pt-1 text-center text-[11px] text-muted-foreground">
          Tiền tour {formatPrice(tourPrice)} — giá cuối do hệ thống chốt lại khi
          thanh toán.
        </p>
      </div>
    </div>
  );
}
