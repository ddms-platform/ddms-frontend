import { Anchor, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import SkyScene from './sky-scene';
import SeaWaves from './sea-waves';
import SailingBoat from './sailing-boat';
import HeroSearchPill from './hero-search-pill';

/**
 * Hero landing page: một cảnh biển Đà Nẵng lúc hoàng hôn (hoặc đêm sao ở chế độ tối)
 * dựng hoàn toàn bằng CSS và SVG — không dùng video nền, nên nhẹ và không tốn băng thông.
 *
 * Thứ tự xếp lớp từ xa tới gần: trời → cầu Rồng → thuyền → sóng → nội dung.
 */
export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section
      id="top"
      className="relative h-screen min-h-160 overflow-hidden select-none
                 bg-linear-to-b from-[#ffe9d6] via-[#ffc9b0] to-sea-1
                 dark:from-[#0a0f24] dark:via-[#1b2450] dark:to-[#0e3a54]"
    >
      <SkyScene />
      <SailingBoat />
      <SeaWaves />

      <div
        className="relative z-10 mx-auto flex h-1/2 min-h-120 max-w-215 flex-col items-center
                   justify-center px-6 text-center"
      >
        <span
          className="mb-5.5 inline-flex items-center gap-2 rounded-[22px] border border-white/90
                     bg-white/85 px-4.5 py-2 text-[13px] font-semibold text-foreground shadow-sm
                     backdrop-blur-sm dark:border-white/15 dark:bg-black/50"
        >
          <Anchor size={14} />
          {t('home.hero.badge', 'Bến du thuyền số của thành phố Đà Nẵng')}
        </span>

        <h1
          className="mb-4.5 text-[clamp(34px,5vw,58px)] leading-[1.12] font-extrabold tracking-[-1.2px]
                     [text-shadow:0_1px_2px_rgba(255,255,255,.65),0_4px_24px_rgba(255,255,255,.5)]
                     dark:[text-shadow:0_2px_20px_rgba(0,0,0,.55)]"
        >
          {t('home.hero.titleLine1', 'Đặt du thuyền sông Hàn')}
          <br />
          <span className="text-ddms-primary dark:text-[#ff5c7a]">
            {t('home.hero.titleLine2', 'dễ như đặt phòng')}
          </span>
        </h1>

        <p
          className="mb-6 max-w-140 text-[clamp(15px,1.6vw,19px)] font-semibold text-[#333c40]
                     [text-shadow:0_1px_2px_rgba(255,255,255,.65),0_2px_16px_rgba(255,255,255,.45)]
                     dark:text-[#c3ccd3] dark:[text-shadow:0_2px_14px_rgba(0,0,0,.5)]"
        >
          {t(
            'home.hero.subtitle',
            'Gần 100 du thuyền, cano và tàu nhà hàng — giá niêm yết, lịch trống thời gian thực, thanh toán an toàn.',
          )}
        </p>

        <HeroSearchPill />
      </div>

      <div className="ddms-anim-hint absolute bottom-6.5 left-1/2 z-10 -translate-x-1/2 text-center text-[13px] font-semibold text-white/95">
        {t('home.hero.scrollHint', 'Cuộn xuống để khám phá')}
        <ChevronDown size={16} className="mx-auto mt-1.5" />
      </div>
    </section>
  );
}
