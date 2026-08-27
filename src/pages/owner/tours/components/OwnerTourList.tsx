import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Ship,
  ExternalLink,
  Pencil,
  Package,
  Clock3,
  XCircle,
  CalendarDays,
  BookOpen,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { OwnerTourListItem } from '@/services/tourService';

interface OwnerTourListProps {
  tours: OwnerTourListItem[];
  /** Phân biệt "chưa có tour" với "gọi API thất bại". */
  loadFailed?: boolean;
}

type StatusFilter = 'all' | 'active' | 'pending' | 'onSchedule';

const STATUS_STYLES: Record<string, string> = {
  active:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
};

const TourStatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const key = (status || '').toLowerCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES.inactive;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {t(`ownerTours.tourList.status.${key}`, status)}
    </span>
  );
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h${mins}`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

const OwnerTourList = ({ tours, loadFailed = false }: OwnerTourListProps) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const registeredTours = useMemo(
    () =>
      tours.filter((tour) => (tour.status || '').toLowerCase() !== 'rejected'),
    [tours],
  );

  const rejectedTours = useMemo(
    () =>
      tours.filter((tour) => (tour.status || '').toLowerCase() === 'rejected'),
    [tours],
  );

  const counts = useMemo(() => {
    const base = {
      all: registeredTours.length,
      active: 0,
      pending: 0,
      onSchedule: 0,
    };
    for (const tour of registeredTours) {
      const status = (tour.status || '').toLowerCase();
      if (status === 'active') base.active += 1;
      else if (status === 'pending') base.pending += 1;
      if (tour.upcomingScheduleCount > 0) base.onSchedule += 1;
    }
    return base;
  }, [registeredTours]);

  const visibleTours = useMemo(() => {
    if (filter === 'all') return registeredTours;
    if (filter === 'onSchedule') {
      return registeredTours.filter((tour) => tour.upcomingScheduleCount > 0);
    }
    return registeredTours.filter(
      (tour) => (tour.status || '').toLowerCase() === filter,
    );
  }, [registeredTours, filter]);

  const filters: { key: StatusFilter; count: number }[] = [
    { key: 'all', count: counts.all },
    { key: 'active', count: counts.active },
    { key: 'pending', count: counts.pending },
    { key: 'onSchedule', count: counts.onSchedule },
  ];

  const renderTourCard = (tour: OwnerTourListItem, isRejected = false) => {
    const isActive = (tour.status || '').toLowerCase() === 'active';

    return (
      <div
        key={tour.id}
        className={`flex flex-col rounded-xl border overflow-hidden transition-colors ${
          isRejected
            ? 'border-rose-500/30 bg-rose-500/5'
            : 'border-border bg-muted/20 hover:border-ddms-secondary/50'
        }`}
      >
        <div className="h-32 w-full bg-muted/50 overflow-hidden">
          {tour.thumbnailUrl ? (
            <img
              src={tour.thumbnailUrl}
              alt={tour.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Ship className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-foreground leading-snug"
              title={tour.name}
            >
              {tour.name}
            </h3>
            <TourStatusBadge status={tour.status} />
          </div>

          <div className="text-sm text-ddms-secondary font-bold">
            {formatPrice(tour.price)}
            <span className="ml-2 text-xs font-medium text-muted-foreground">
              {formatDuration(tour.durationMinutes)}
            </span>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {tour.boatNames.length > 0
                  ? tour.boatNames.join(', ')
                  : t('ownerTours.tourList.noBoat')}
              </span>
            </div>
            {!isRejected && (
              <>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {tour.nextScheduleAt
                      ? t('ownerTours.tourList.nextSchedule', {
                          date: new Date(tour.nextScheduleAt).toLocaleString(
                            i18n.language,
                            {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          ),
                        })
                      : t('ownerTours.tourList.noSchedule')}
                  </span>
                </div>
                <div>
                  {t('ownerTours.tourList.scheduleCount', {
                    upcoming: tour.upcomingScheduleCount,
                    total: tour.scheduleCount,
                  })}
                </div>
                {tour.upcomingScheduleCount === 0 && (
                  <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[11px] font-medium leading-snug text-amber-700 dark:text-amber-400">
                    {isActive
                      ? t('ownerTours.tourList.missingScheduleLive')
                      : t('ownerTours.tourList.missingSchedule')}
                  </p>
                )}
              </>
            )}
            {isRejected && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-[11px] leading-snug text-rose-700 dark:text-rose-300">
                <p className="font-semibold mb-0.5">
                  {t('ownerTours.rejectedList.reasonLabel')}
                </p>
                <p>
                  {tour.rejectionReason?.trim()
                    ? tour.rejectionReason
                    : t('ownerTours.rejectedList.noReason')}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {!isRejected &&
              (isActive ? (
                <Link
                  to={`/tours/${tour.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ddms-secondary px-3 py-1.5 text-xs font-bold text-white hover:bg-ddms-secondary/90 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('ownerTours.tourList.viewPublic')}
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                  title={t('ownerTours.tourList.notPublicHint')}
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  {t('ownerTours.tourList.notPublic')}
                </span>
              ))}

            {tour.primaryBoatId && (
              <Link
                to={`/owner/boats/${tour.primaryBoatId}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                {isRejected
                  ? t('ownerTours.rejectedList.editAndResubmit')
                  : t('ownerTours.tourList.edit')}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ddms-secondary/25 bg-ddms-secondary/5 p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-ddms-secondary shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t('ownerTours.rules.title')}
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
              <li>{t('ownerTours.rules.item1')}</li>
              <li>{t('ownerTours.rules.item2')}</li>
              <li>{t('ownerTours.rules.item3')}</li>
              <li>{t('ownerTours.rules.item4')}</li>
              <li>{t('ownerTours.rules.item5')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-ddms-secondary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {t('ownerTours.tourList.title')}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('ownerTours.tourList.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map(({ key, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  filter === key
                    ? 'bg-ddms-secondary text-white border-ddms-secondary'
                    : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {t(`ownerTours.tourList.filters.${key}`)} ({count})
              </button>
            ))}
          </div>
        </div>

        {loadFailed ? (
          <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 py-10 text-center">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {t('ownerTours.tourList.loadError')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('ownerTours.tourList.loadErrorHint')}
            </p>
          </div>
        ) : visibleTours.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {registeredTours.length === 0
                ? t('ownerTours.tourList.empty')
                : t('ownerTours.tourList.emptyFilter')}
            </p>
            {registeredTours.length === 0 && (
              <Link
                to="/owner/boats"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ddms-secondary hover:underline"
              >
                {t('ownerTours.tourList.registerCta')} &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleTours.map((tour) => renderTourCard(tour))}
          </div>
        )}
      </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-semibold text-foreground leading-snug"
                      title={tour.name}
                    >
                      {tour.name}
                    </h3>
                    <TourStatusBadge status={tour.status} />
                  </div>

                  <div className="text-sm text-ddms-secondary font-bold">
                    {formatPrice(tour.price)}
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      {formatDuration(tour.durationMinutes)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {tour.boatNames.length > 0
                          ? tour.boatNames.join(', ')
                          : t('ownerTours.tourList.noBoat')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {tour.nextScheduleAt
                          ? t('ownerTours.tourList.nextSchedule', {
                              date: new Date(
                                tour.nextScheduleAt,
                              ).toLocaleString(i18n.language, {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              }),
                            })
                          : t('ownerTours.tourList.noSchedule')}
                      </span>
                    </div>
                    <div>
                      {t('ownerTours.tourList.scheduleCount', {
                        upcoming: tour.upcomingScheduleCount,
                        total: tour.scheduleCount,
                      })}
                    </div>
                    {tour.upcomingScheduleCount === 0 && (
                      <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[11px] font-medium leading-snug text-amber-700 dark:text-amber-400">
                        {isActive
                          ? t('ownerTours.tourList.missingScheduleLive')
                          : t('ownerTours.tourList.missingSchedule')}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {isActive ? (
                      <Link
                        to={`/tours/${tour.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-ddms-secondary px-3 py-1.5 text-xs font-bold text-white hover:bg-ddms-secondary/90 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t('ownerTours.tourList.viewPublic')}
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                        title={t('ownerTours.tourList.notPublicHint')}
                      >
                        <Clock3 className="w-3.5 h-3.5" />
                        {t('ownerTours.tourList.notPublic')}
                      </span>
                    )}

                    {tour.primaryBoatId && (
                      <Link
                        to={`/owner/boats/${tour.primaryBoatId}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t('ownerTours.tourList.edit')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filter === 'onSchedule' && visibleTours.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          {t('ownerTours.tourList.onScheduleHint')}
        </p>
      )}
    </div>
  );
};

export default OwnerTourList;
