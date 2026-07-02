import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin } from 'lucide-react';
import heroBg from '@/assets/danang_cruise_hero.jpg';

export default function HeroSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center min-h-130 flex items-center"
      style={{
        backgroundImage: `url(${heroBg})`,
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-950/50 to-transparent z-0" />

      {/* Decorative blurred gradient blobs */}
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-linear-to-tr from-cyan-400/20 to-blue-500/10 blur-3xl opacity-40 pointer-events-none z-10" />
      <div className="absolute -bottom-16 left-20 h-72 w-72 rounded-full bg-linear-to-br from-amber-400/15 to-rose-400/10 blur-3xl opacity-30 pointer-events-none z-10" />

      <div className="relative mx-auto max-w-7xl w-full px-6 py-20 md:py-28 z-10">
        <div className="max-w-2xl">
          <h1
            className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
            style={{ letterSpacing: '-0.44px' }}
          >
            {t('home.hero.title')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-200 md:text-xl">
            {t('home.hero.description')}
          </p>

          {/* Search Bar */}
          <div className="mt-10 flex items-center gap-3 rounded-2xl p-2 bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-white/10">
            <div className="flex flex-1 items-center gap-3 px-4">
              <MapPin size={20} className="text-slate-500" />
              <input
                type="text"
                placeholder={t('home.hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent py-3 text-sm font-medium outline-none text-slate-900 dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:bg-ddms-secondary/90 active:scale-[0.98] bg-ddms-secondary cursor-pointer">
              <Search size={18} />
              <span className="hidden sm:inline">
                {t('home.hero.searchButton')}
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-10">
            {[
              { value: '500+', label: t('home.hero.stat1') },
              { value: '10K+', label: t('home.hero.stat2') },
              { value: '4.9', label: t('home.hero.stat3') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
