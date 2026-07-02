import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeName } from '@/constants/route-name';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  Headset,
  Ship,
} from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&h=900&fit=crop';

const cardShadow =
  'rgba(0,0,0,0.08) 0px 8px 24px, rgba(0,0,0,0.04) 0px 0px 0px 1px';

const benefits = [
  { icon: Ship, key: 'manageTours' },
  { icon: CalendarCheck, key: 'scheduleBoats' },
  { icon: ClipboardCheck, key: 'receiveBookings' },
];

const processSteps = [
  { icon: ClipboardCheck, key: 'profile' },
  { icon: BadgeCheck, key: 'verify' },
  { icon: Ship, key: 'publish' },
];

const requirements = [
  { icon: FileCheck2, key: 'license' },
  { icon: Ship, key: 'boatInfo' },
  { icon: Headset, key: 'contact' },
];

export default function BecomeOwnerPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <section
        className="relative min-h-140 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 48%, rgba(0,0,0,0.1) 100%), url(${HERO_IMAGE})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto flex min-h-140 max-w-7xl items-center px-6 py-20">
          <div className="max-w-2xl">
            <p
              className="mb-4 text-xs font-bold uppercase"
              style={{ color: '#ffffff', letterSpacing: '0.32px' }}
            >
              {t('becomeOwner.hero.eyebrow')}
            </p>
            <h1
              className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              {t('becomeOwner.hero.title')}
            </h1>
            <p
              className="mt-6 max-w-xl text-lg font-medium leading-relaxed md:text-xl"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {t('becomeOwner.hero.description')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={routeName.ownerRegistration}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--ddms-secondary)',
                  color: '#ffffff',
                }}
              >
                {t('becomeOwner.hero.primaryCta')}
                <ArrowRight size={18} />
              </Link>
              <Link
                to={routeName.tours}
                className="inline-flex h-12 items-center justify-center rounded-lg border px-6 text-base font-semibold transition-all hover:bg-white/10"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                {t('becomeOwner.hero.secondaryCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <h2
              className="text-[28px] font-bold leading-[1.43] text-foreground"
              style={{ letterSpacing: '-0.44px' }}
            >
              {t('becomeOwner.benefits.title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('becomeOwner.benefits.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map(({ icon: Icon, key }) => (
              <article
                key={key}
                className="rounded-2xl p-6 bg-ddms-bg-card border border-border/60 transition-all duration-300 hover:shadow-md"
                style={{ boxShadow: cardShadow }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--ddms-secondary), #00d4e0)',
                    color: '#ffffff',
                  }}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <h3
                  className="text-xl font-semibold leading-tight text-foreground"
                  style={{ letterSpacing: '-0.18px' }}
                >
                  {t(`becomeOwner.benefits.items.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(`becomeOwner.benefits.items.${key}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <h2
              className="text-[28px] font-bold leading-[1.43] text-foreground"
              style={{ letterSpacing: '-0.44px' }}
            >
              {t('becomeOwner.process.title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('becomeOwner.process.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map(({ icon: Icon, key }, index) => (
              <article
                key={key}
                className="rounded-2xl p-6 bg-ddms-bg-card border border-border/60 transition-all duration-300 hover:shadow-md"
                style={{ boxShadow: cardShadow }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--ddms-secondary), #00d4e0)',
                      color: '#ffffff',
                    }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-ddms-secondary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3
                  className="text-xl font-semibold leading-tight text-foreground"
                  style={{ letterSpacing: '-0.18px' }}
                >
                  {t(`becomeOwner.process.steps.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(`becomeOwner.process.steps.${key}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2
              className="text-[28px] font-bold leading-[1.43] text-foreground"
              style={{ letterSpacing: '-0.44px' }}
            >
              {t('becomeOwner.requirements.title')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('becomeOwner.requirements.subtitle')}
            </p>
            <Link
              to={routeName.ownerRegistration}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--ddms-secondary)',
                color: '#ffffff',
              }}
            >
              {t('becomeOwner.requirements.cta')}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-4">
            {requirements.map(({ icon: Icon, key }) => (
              <article
                key={key}
                className="flex gap-4 rounded-2xl p-5 bg-ddms-bg-card border border-border/60 transition-all duration-300 hover:shadow-md"
                style={{ boxShadow: cardShadow }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ddms-secondary/10 text-ddms-secondary">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(`becomeOwner.requirements.items.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`becomeOwner.requirements.items.${key}.description`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
