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
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { OwnerTourListItem } from '@/services/tourService';

interface OwnerTourListProps {
  tours: OwnerTourListItem[];
  /** Phân biệt "chưa có tour" với "gọi API thất bại". */
  loadFailed?: boolean;
}

type StatusFilter = 'all' | 'active' | 'pending' | 'onSchedule';

const PAGE_SIZE = 6;

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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${style}`}
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
  const [showAllRegistered, setShowAllRegistered] = useState(false);
  const [rejectedOpen, setRejectedOpen] = useState(false);

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

  const displayedTours = showAllRegistered
    ? visibleTours
    : visibleTours.slice(0, PAGE_SIZE);
  const hiddenCount = Math.max(0, visibleTours.length - PAGE_SIZE);

  const filters: { key: StatusFilter; count: number }[] = [
    { key: 'all', count: counts.all },
    { key: 'active', count: counts.active },
    { key: 'pending', count: counts.pending },
    { key: 'onSchedule', count: counts.onSchedule },
  ];

  const renderTourRow = (tour: OwnerTourListItem, isRejected = false) => {
    const isActive = (tour.status || '').toLowerCase() === 'active';
    const missingSchedule = !isRejected && tour.upcomingScheduleCount === 0;

    return (
      <div
        key={tour.id}
        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
          isRejected
            ? 'border-rose-500/25 bg-rose-500/5'
            : 'border-border bg-muted/15 hover:border-ddms-secondary/40'
        }`}
      >
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted/50">
          {tour.thumbnailUrl ? (
            <img
              src={tour.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Ship className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="truncate text-sm font-semibold text-foreground"
              title={tour.name}
            >
              {tour.name}
            </h3>
            <TourStatusBadge status={tour.status} />
            {missingSchedule && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400"
                title={
                  isActive
                    ? t('ownerTours.tourList.missingScheduleLive')
                    : t('ownerTours.tourList.missingSchedule')
                }
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {t('ownerTours.tourList.noScheduleShort')}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-ddms-secondary">
              {formatPrice(tour.price)}
              <span className="ml-1 font-medium text-muted-foreground">
                · {formatDuration(tour.durationMinutes)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 truncate max-w-48">
              <Ship className="w-3 h-3 shrink-0" />
              {tour.boatNames.length > 0
                ? tour.boatNames.join(', ')
                : t('ownerTours.tourList.noBoat')}
            </span>
            {!isRejected && (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="w-3 h-3 shrink-0" />
                {tour.nextScheduleAt
                  ? new Date(tour.nextScheduleAt).toLocaleString(
                      i18n.language,
                      {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )
                  : t('ownerTours.tourList.scheduleCount', {
                      upcoming: tour.upcomingScheduleCount,
                      total: tour.scheduleCount,
                    })}
              </span>
            )}
          </div>

          {isRejected && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-rose-700 dark:text-rose-300">
              <span className="font-semibold">
                {t('ownerTours.rejectedList.reasonLabel')}:{' '}
              </span>
              {tour.rejectionReason?.trim()
                ? tour.rejectionReason
                : t('ownerTours.rejectedList.noReason')}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!isRejected &&
            (isActive ? (
              <Link
                to={`/tours/${tour.id}`}
                className="inline-flex items-center gap-1 rounded-md bg-ddms-secondary px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-ddms-secondary/90"
                title={t('ownerTours.tourList.viewPublic')}
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {t('ownerTours.tourList.viewPublic')}
                </span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground"
                title={t('ownerTours.tourList.notPublicHint')}
              >
                <Clock3 className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {t('ownerTours.tourList.notPublic')}
                </span>
              </span>
            ))}

          {tour.primaryBoatId && (
            <Link
              to={`/owner/boats/${tour.primaryBoatId}/edit?tab=services&tourId=${tour.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-foreground/5"
              title={
                isRejected
                  ? t('ownerTours.rejectedList.editAndResubmit')
                  : t('ownerTours.tourList.edit')
              }
            >
              <Pencil className="w-3 h-3" />
              <span className="hidden sm:inline">
                {isRejected
                  ? t('ownerTours.rejectedList.editAndResubmit')
                  : t('ownerTours.tourList.edit')}
              </span>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-ddms-bg-card rounded-xl border border-border p-5 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-ddms-secondary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t('ownerTours.tourList.title')}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('ownerTours.tourList.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filters.map(({ key, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilter(key);
                  setShowAllRegistered(false);
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
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
          <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 py-8 text-center">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {t('ownerTours.tourList.loadError')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('ownerTours.tourList.loadErrorHint')}
            </p>
          </div>
        ) : visibleTours.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {registeredTours.length === 0
                ? t('ownerTours.tourList.empty')
                : t('ownerTours.tourList.emptyFilter')}
            </p>
            {registeredTours.length === 0 && (
              <Link
                to="/owner/boats"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ddms-secondary hover:underline"
              >
                {t('ownerTours.tourList.registerCta')} &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedTours.map((tour) => renderTourRow(tour))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllRegistered((v) => !v)}
                className="w-full rounded-md border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer transition-colors"
              >
                {showAllRegistered
                  ? t('ownerTours.tourList.showLess')
                  : t('ownerTours.tourList.showMore', { count: hiddenCount })}
              </button>
            )}
          </div>
        )}

        {filter === 'onSchedule' && visibleTours.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {t('ownerTours.tourList.onScheduleHint')}
          </p>
        )}
      </div>

      {rejectedTours.length > 0 && (
        <div className="bg-ddms-bg-card rounded-xl border border-rose-500/25 p-4 shadow-xl">
          <button
            type="button"
            onClick={() => setRejectedOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t('ownerTours.rejectedList.title')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('ownerTours.rejectedList.subtitle', {
                    count: rejectedTours.length,
                  })}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                rejectedOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {rejectedOpen && (
            <div className="mt-3 space-y-2">
              {rejectedTours.map((tour) => renderTourRow(tour, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerTourList;
