import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MapPin,
  Plus,
  Ship,
  TicketCheck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge, type BadgeVariant } from '@/components/badges';
import { formatPrice } from '@/lib/utils';

type MetricKey = 'todayBookings' | 'todayRevenue' | 'departures' | 'readyBoats';
type ScheduleStatus = 'boarding' | 'scheduled' | 'attention';
type BookingStatus = 'pending' | 'paid' | 'review';
type BoatStatus = 'running' | 'idle' | 'maintenance';

interface Metric {
  key: MetricKey;
  value: string;
  icon: LucideIcon;
}

interface Schedule {
  time: string;
  tour: string;
  boat: string;
  dock: string;
  guests: number;
  capacity: number;
  status: ScheduleStatus;
}

interface BookingItem {
  code: string;
  guest: string;
  tour: string;
  guests: number;
  total: number;
  status: BookingStatus;
}

interface BoatItem {
  name: string;
  status: BoatStatus;
  next: string;
}

const cardShadow = 'rgba(0,0,0,0.22) 0px 8px 24px, rgba(255,255,255,0.06) 0px 0px 0px 1px';

const metrics: Metric[] = [
  { key: 'todayBookings', value: '18', icon: TicketCheck },
  { key: 'todayRevenue', value: '24.6M', icon: CircleDollarSign },
  { key: 'departures', value: '7', icon: CalendarClock },
  { key: 'readyBoats', value: '5/6', icon: Ship },
];

const schedules: Schedule[] = [
  {
    time: '17:30',
    tour: 'Tour Sông Hàn Hoàng Hôn',
    boat: 'Dragon Cruise',
    dock: 'Bến Bạch Đằng',
    guests: 32,
    capacity: 45,
    status: 'boarding',
  },
  {
    time: '19:00',
    tour: 'Sông Hàn Về Đêm',
    boat: 'Han River Pearl',
    dock: 'Bến Bạch Đằng',
    guests: 41,
    capacity: 50,
    status: 'scheduled',
  },
  {
    time: '20:30',
    tour: 'Cầu Rồng Cuối Tuần',
    boat: 'Marina Star',
    dock: 'Bến Sơn Trà',
    guests: 24,
    capacity: 30,
    status: 'attention',
  },
];

const bookings: BookingItem[] = [
  {
    code: 'DDMS-8A91',
    guest: 'Nguyễn Minh Anh',
    tour: 'Tour Sông Hàn Hoàng Hôn',
    guests: 4,
    total: 1800000,
    status: 'pending',
  },
  {
    code: 'DDMS-6F22',
    guest: 'Tran Family',
    tour: 'Sông Hàn Về Đêm',
    guests: 6,
    total: 2700000,
    status: 'paid',
  },
  {
    code: 'DDMS-4C18',
    guest: 'Lê Quốc Bảo',
    tour: 'Cầu Rồng Cuối Tuần',
    guests: 2,
    total: 900000,
    status: 'review',
  },
];

const boats: BoatItem[] = [
  { name: 'Dragon Cruise', status: 'running', next: '17:30' },
  { name: 'Han River Pearl', status: 'idle', next: '19:00' },
  { name: 'Marina Star', status: 'maintenance', next: 'N/A' },
  { name: 'Sunset Queen', status: 'idle', next: '21:00' },
];

const scheduleBadgeVariants: Record<ScheduleStatus, BadgeVariant> = {
  boarding: 'ownerBoarding',
  scheduled: 'ownerScheduled',
  attention: 'ownerAttention',
};

const bookingBadgeVariants: Record<BookingStatus, BadgeVariant> = {
  pending: 'ownerPending',
  paid: 'ownerPaid',
  review: 'ownerReview',
};

const boatBadgeVariants: Record<BoatStatus, BadgeVariant> = {
  running: 'ownerRunning',
  idle: 'ownerIdle',
  maintenance: 'ownerMaintenance',
};

export default function OwnerDashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A192F' }}>
      <section className="mx-auto max-w-7xl px-6 py-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p
              className="text-xs font-bold uppercase"
              style={{ color: '#00F0FF', letterSpacing: '0.32px' }}
            >
              {t('ownerDashboard.eyebrow')}
            </p>
            <h1
              className="mt-3 text-3xl font-bold leading-tight md:text-4xl"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              {t('ownerDashboard.title')}
            </h1>
            <p
              className="mt-3 max-w-2xl text-sm leading-relaxed md:text-base"
              style={{ color: '#ecf0ff' }}
            >
              {t('ownerDashboard.description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/owner/tours/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#00F0FF', color: '#0A192F' }}
            >
              <Plus size={18} />
              {t('ownerDashboard.actions.createTour')}
            </Link>
            <Link
              to="/owner/schedules"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.16)', color: '#ffffff' }}
            >
              <CalendarClock size={18} />
              {t('ownerDashboard.actions.viewSchedule')}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ key, value, icon: Icon }) => (
            <article
              key={key}
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#112240', boxShadow: cardShadow }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
                    {t(`ownerDashboard.metrics.${key}.label`)}
                  </p>
                  <p className="mt-3 text-3xl font-bold" style={{ color: '#ffffff' }}>
                    {value}
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                    color: '#0A192F',
                  }}
                >
                  <Icon size={21} />
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed" style={{ color: '#ecf0ff' }}>
                {t(`ownerDashboard.metrics.${key}.helper`)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <section
            className="rounded-2xl p-5 md:p-6"
            style={{ backgroundColor: '#112240', boxShadow: cardShadow }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                  {t('ownerDashboard.departures.title')}
                </h2>
                <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerDashboard.departures.subtitle')}
                </p>
              </div>
              <Clock3 size={22} style={{ color: '#00F0FF' }} />
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {schedules.map((schedule) => (
                <div
                  key={`${schedule.time}-${schedule.boat}`}
                  className="grid gap-4 py-4 md:grid-cols-[72px_1fr_120px]"
                >
                  <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                    {schedule.time}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold" style={{ color: '#ffffff' }}>
                        {schedule.tour}
                      </h3>
                      <StatusBadge
                        label={t(`ownerDashboard.status.schedule.${schedule.status}`)}
                        variant={scheduleBadgeVariants[schedule.status]}
                        showIcon={false}
                        blur={false}
                      />
                    </div>
                    <div
                      className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm"
                      style={{ color: '#ecf0ff' }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Ship size={15} />
                        {schedule.boat}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} />
                        {schedule.dock}
                      </span>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                      {schedule.guests}/{schedule.capacity}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: '#ecf0ff' }}>
                      {t('ownerDashboard.departures.guests')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-2xl p-5 md:p-6"
            style={{ backgroundColor: '#112240', boxShadow: cardShadow }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                  {t('ownerDashboard.fleet.title')}
                </h2>
                <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerDashboard.fleet.subtitle')}
                </p>
              </div>
              <Ship size={22} style={{ color: '#00F0FF' }} />
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {boats.map((boat) => (
                <div key={boat.name} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>
                      {boat.name}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: '#ecf0ff' }}>
                      {t('ownerDashboard.fleet.next')}: {boat.next}
                    </p>
                  </div>
                  <StatusBadge
                    label={t(`ownerDashboard.status.boat.${boat.status}`)}
                    variant={boatBadgeVariants[boat.status]}
                    showIcon={false}
                    blur={false}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section
            className="rounded-2xl p-5 md:p-6"
            style={{ backgroundColor: '#112240', boxShadow: cardShadow }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                  {t('ownerDashboard.bookings.title')}
                </h2>
                <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerDashboard.bookings.subtitle')}
                </p>
              </div>
              <TicketCheck size={22} style={{ color: '#00F0FF' }} />
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {bookings.map((booking) => (
                <div key={booking.code} className="grid gap-3 py-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold" style={{ color: '#ffffff' }}>
                        {booking.guest}
                      </p>
                      <span className="text-xs" style={{ color: '#ecf0ff' }}>
                        {booking.code}
                      </span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                      {booking.tour} · {booking.guests} {t('ownerDashboard.bookings.guests')}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                      {formatPrice(booking.total)}
                    </p>
                    <div className="mt-1 flex md:justify-end">
                      <StatusBadge
                        label={t(`ownerDashboard.status.booking.${booking.status}`)}
                        variant={bookingBadgeVariants[booking.status]}
                        showIcon={false}
                        blur={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-2xl p-5 md:p-6"
            style={{ backgroundColor: '#112240', boxShadow: cardShadow }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                  {t('ownerDashboard.readiness.title')}
                </h2>
                <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerDashboard.readiness.subtitle')}
                </p>
              </div>
              <AlertTriangle size={22} style={{ color: '#F59E0B' }} />
            </div>

            <div className="space-y-4">
              {[
                { done: true, icon: CheckCircle2, key: 'profile' },
                { done: true, icon: Ship, key: 'boats' },
                { done: false, icon: Wrench, key: 'maintenance' },
                { done: false, icon: Users, key: 'capacity' },
              ].map(({ done, icon: Icon, key }) => (
                <div key={key} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: done ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)',
                      color: done ? '#10B981' : '#F59E0B',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>
                      {t(`ownerDashboard.readiness.items.${key}.title`)}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
                      {t(`ownerDashboard.readiness.items.${key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/owner/schedules"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#00F0FF' }}
            >
              {t('ownerDashboard.readiness.review')}
              <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}
