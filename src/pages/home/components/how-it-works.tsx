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
    <section
      id="how-it-works"
      className="py-16 border-t border-b"
      style={{
        backgroundColor: 'var(--ddms-bg-main)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2
            className="text-[28px] font-bold leading-[1.43] text-foreground"
            style={{ letterSpacing: '-0.44px' }}
          >
            {t('home.howItWorks.title')}
          </h2>
          <p className="mt-2 text-sm text-foreground/80">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, step }) => (
            <div
              key={step}
              className="flex flex-col items-center rounded-2xl p-8 text-center border transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--ddms-bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ddms-secondary), #00d4e0)',
                }}
              >
                <Icon size={28} color="#ffffff" />
              </div>
              <span
                className="mb-2 text-xs font-bold"
                style={{
                  color: 'var(--ddms-secondary)',
                  letterSpacing: '0.32px',
                  textTransform: 'uppercase',
                }}
              >
                {t('home.howItWorks.stepLabel', { step })}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {t(`home.howItWorks.step${step}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {t(`home.howItWorks.step${step}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
