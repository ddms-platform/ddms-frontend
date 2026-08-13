import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Field {
  label: string;
  value: string;
  /** Ẩn ở màn hình hẹp để pill không bị bóp nát. */
  hideOnMobile?: boolean;
}

/**
 * Ô tìm kiếm rút gọn trong hero. Đây là lối vào thị giác, không phải form thật —
 * bấm vào sẽ cuộn xuống khối đặt tour đầy đủ bên dưới, nơi có sẵn bộ lọc cảng,
 * tuyến và ngày khởi hành.
 */
export default function HeroSearchPill() {
  const { t } = useTranslation();

  const goToBooking = () => {
    document
      .getElementById('booking-search')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const fields: Field[] = [
    {
      label: t('home.heroSearch.placeLabel', 'Địa điểm'),
      value: t('home.heroSearch.placeValue', 'Sông Hàn · Vịnh Đà Nẵng'),
    },
    {
      label: t('home.heroSearch.dateLabel', 'Ngày đi'),
      value: t('home.heroSearch.dateValue', 'Chọn ngày'),
      hideOnMobile: true,
    },
    {
      label: t('home.heroSearch.guestsLabel', 'Số khách'),
      value: t('home.heroSearch.guestsValue', 'Thêm khách'),
    },
  ];

  return (
    <div
      className="flex w-[min(680px,92vw)] items-stretch gap-0 rounded-[40px] bg-ddms-bg-card p-2
                 shadow-[rgba(0,0,0,0.08)_0_6px_20px,rgba(0,0,0,0.04)_0_0_0_1px] backdrop-blur-md
                 transition-shadow duration-250 hover:shadow-[rgba(0,0,0,0.14)_0_10px_28px,rgba(0,0,0,0.04)_0_0_0_1px]
                 dark:shadow-[rgba(0,0,0,.5)_0_6px_20px,rgba(255,255,255,.06)_0_0_0_1px]"
    >
      {fields.map((f, i) => (
        <button
          key={f.label}
          type="button"
          onClick={goToBooking}
          className={`min-w-0 flex-1 rounded-[32px] px-5 py-2 text-left transition-colors
                      hover:bg-ddms-neutral/70 dark:hover:bg-white/5
                      ${i > 0 ? 'border-l border-border' : ''}
                      ${f.hideOnMobile ? 'hidden sm:block' : ''}`}
        >
          <div className="text-xs font-bold text-foreground">{f.label}</div>
          <div className="truncate text-sm text-muted-foreground">
            {f.value}
          </div>
        </button>
      ))}

      <button
        type="button"
        onClick={goToBooking}
        aria-label={t('home.heroSearch.submit', 'Tìm kiếm')}
        className="grid size-13 shrink-0 cursor-pointer place-items-center self-center rounded-full
                   bg-ddms-primary text-white transition-transform hover:scale-105"
      >
        <Search size={20} strokeWidth={2.6} />
      </button>
    </div>
  );
}
