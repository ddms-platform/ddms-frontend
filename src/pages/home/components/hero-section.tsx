import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin } from 'lucide-react';

export default function HeroSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ff385c 0%, #e00b41 40%, #bd1e59 70%, #460479 100%)',
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-10"
        style={{ backgroundColor: '#ffffff' }}
      />
      <div
        className="absolute -bottom-16 left-20 h-72 w-72 rounded-full opacity-8"
        style={{ backgroundColor: '#ffffff' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <h1
            className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
          >
            {t('home.hero.title')}
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed md:text-xl"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {t('home.hero.description')}
          </p>

          {/* Search Bar */}
          <div
            className="mt-10 flex items-center gap-3 rounded-2xl p-2"
            style={{
              backgroundColor: '#ffffff',
              boxShadow:
                'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            <div className="flex flex-1 items-center gap-3 px-4">
              <MapPin size={20} style={{ color: '#6a6a6a' }} />
              <input
                type="text"
                placeholder={t('home.hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent py-3 text-sm font-medium outline-none"
                style={{ color: '#222222' }}
              />
            </div>
            <button
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#ff385c' }}
            >
              <Search size={18} />
              <span className="hidden sm:inline">{t('home.hero.searchButton')}</span>
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
                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
