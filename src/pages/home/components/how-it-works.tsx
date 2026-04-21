import { useTranslation } from 'react-i18next';
import { Search, Calendar, Ship, Star } from 'lucide-react';

const STEPS = [
  { icon: Search, step: 1 },
  { icon: Calendar, step: 2 },
  { icon: Ship, step: 3 },
  { icon: Star, step: 4 },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-16" style={{ backgroundColor: '#f7f7f7' }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2
            className="text-[28px] font-bold leading-[1.43]"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            {t('home.howItWorks.title')}
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#6a6a6a' }}>
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, step }) => (
            <div
              key={step}
              className="flex flex-col items-center rounded-2xl p-8 text-center transition-all hover:shadow-lg"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px',
              }}
            >
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #ff385c, #e00b41)',
                }}
              >
                <Icon size={28} color="#ffffff" />
              </div>
              <span
                className="mb-2 text-xs font-bold"
                style={{ color: '#ff385c', letterSpacing: '0.32px', textTransform: 'uppercase' }}
              >
                {t('home.howItWorks.stepLabel', { step })}
              </span>
              <h3 className="text-lg font-semibold" style={{ color: '#222222' }}>
                {t(`home.howItWorks.step${step}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6a6a6a' }}>
                {t(`home.howItWorks.step${step}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
