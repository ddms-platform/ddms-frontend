import { useTranslation } from 'react-i18next';
import { Ship, Map, CalendarCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';

export default function OwnerDashboard() {
  const { t } = useTranslation();

  const STATS = [
    {
      label: t('ownerDash.stats.totalBoats'),
      value: '6',
      icon: Ship,
      color: '#00F0FF',
      bg: 'rgba(0,240,255,0.1)',
    },
    {
      label: t('ownerDash.stats.activeTours'),
      value: '9',
      icon: Map,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
    },
    {
      label: t('ownerDash.stats.monthlyBookings'),
      value: '47',
      icon: CalendarCheck,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      label: t('ownerDash.stats.monthlyRevenue'),
      value: formatPrice(125000000),
      icon: TrendingUp,
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.1)',
    },
  ];

  const LINKS = [
    {
      to: '/owner/boats',
      label: t('ownerDash.links.boats'),
      desc: t('ownerDash.links.boatsDesc'),
      icon: Ship,
    },
    {
      to: '/owner/tours',
      label: t('ownerDash.links.tours'),
      desc: t('ownerDash.links.toursDesc'),
      icon: Map,
    },
    {
      to: '/owner/bookings',
      label: t('ownerDash.links.bookings'),
      desc: t('ownerDash.links.bookingsDesc'),
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1
        className="text-2xl font-bold"
        style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
      >
        {t('ownerDash.title')}
      </h1>
      <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
        {t('ownerDash.subtitle')}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: '#112240',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <p className="mt-3 text-xl font-bold" style={{ color: '#ffffff' }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-2xl p-6"
        style={{
          backgroundColor: '#112240',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
          {t('ownerDash.quickStart')}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl p-4 transition-all hover:scale-[1.01] hover:bg-white/2"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(0,240,255,0.08)' }}
              >
                <item.icon size={18} style={{ color: '#00F0FF' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                  {item.label}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
