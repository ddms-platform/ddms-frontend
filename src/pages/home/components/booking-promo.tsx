import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CyanAnimatedButton } from '@/components/common/CyanAnimatedButton';
import DateInput from '@/components/ui/date-input';

export default function BookingPromo() {
  const { t } = useTranslation();
  const [departureDate, setDepartureDate] = useState('2026-07-04');

  const handleSearchClick = () => {
    // Simple mock search action
    window.location.href = '/tours';
  };

  return (
    <section className="bg-transparent text-foreground py-16 px-6 select-none border-none">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Search Form Card ── */}
          <div className="border border-border rounded-2xl p-6 flex flex-col justify-between relative min-h-120 bg-ddms-bg-card backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              {/* Departure Port */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-4 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.departurePort')}
                </label>
                <select className="bg-transparent text-foreground text-sm outline-none border-none cursor-pointer w-full font-medium">
                  <option
                    value="han_river"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.portHanRiver')}
                  </option>
                  <option
                    value="bach_dang"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.portBachDang')}
                  </option>
                  <option
                    value="tien_sa"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.portTienSa')}
                  </option>
                </select>
              </div>

              {/* Route */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-4 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.route')}
                </label>
                <select className="bg-transparent text-foreground text-sm outline-none border-none cursor-pointer w-full font-medium">
                  <option
                    value="han_river_sightseeing"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.routeHanRiver')}
                  </option>
                  <option
                    value="danang_bay"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.routeDanangBay')}
                  </option>
                  <option
                    value="hon_chao"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.routeHonChao')}
                  </option>
                  <option
                    value="sunset_cruise"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.routeSunset')}
                  </option>
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-4 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.departureDate')}
                </label>
                <DateInput
                  value={departureDate}
                  onChange={setDepartureDate}
                  className="bg-transparent text-foreground text-sm outline-none border-none w-full font-medium placeholder:text-muted-foreground"
                />
              </div>

              {/* Guests */}
              <div className="flex flex-col gap-1 border border-border rounded-xl px-4 py-2.5 mb-6 bg-ddms-bg-main/40">
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                  {t('home.promo.guests')}
                </label>
                <select className="bg-transparent text-foreground text-sm outline-none border-none cursor-pointer w-full font-medium">
                  <option value="1" className="bg-ddms-bg-card text-foreground">
                    {t('home.promo.guest')}
                  </option>
                  <option value="2" className="bg-ddms-bg-card text-foreground">
                    {t('home.promo.guests2')}
                  </option>
                  <option value="3" className="bg-ddms-bg-card text-foreground">
                    {t('home.promo.guests3')}
                  </option>
                  <option
                    value="family"
                    className="bg-ddms-bg-card text-foreground"
                  >
                    {t('home.promo.family')}
                  </option>
                </select>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-4 flex flex-col gap-6">
              <CyanAnimatedButton onClick={handleSearchClick}>
                {t('home.promo.bookNow')}
              </CyanAnimatedButton>
            </div>
          </div>

          {/* ── Right Columns: Promotional Cards ── */}
          {/* Card 1: DIFF Fireworks */}
          <a
            href="/tours"
            className="flex flex-col rounded-2xl overflow-hidden border border-border bg-ddms-bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          >
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://diff.vn/wp-content/uploads/2026/07/khan-dai-scaled.jpg"
                alt="DIFF Fireworks Night"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-60" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-rose-500 font-bold block mb-1">
                {t('home.promo.fireworksCategory')}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">
                {t('home.promo.fireworksTitle')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {t('home.promo.fireworksDesc')}
              </p>
            </div>
          </a>

          {/* Card 2: Catamaran Sunset */}
          <a
            href="/tours"
            className="flex flex-col rounded-2xl overflow-hidden border border-border bg-ddms-bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          >
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80"
                alt="Luxury Catamaran Sunset"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-60" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold block mb-1">
                {t('home.promo.sunsetCategory')}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">
                {t('home.promo.sunsetTitle')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {t('home.promo.sunsetDesc')}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
