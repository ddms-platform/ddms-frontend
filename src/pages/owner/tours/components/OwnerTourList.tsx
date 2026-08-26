import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Ship, ExternalLink, Pencil, Package, Clock3 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { OwnerTourListItem } from '@/services/tourService';

interface OwnerTourListProps {
  tours: OwnerTourListItem[];
  /** Phân biệt "chưa có tour" với "gọi API thất bại". */
  loadFailed?: boolean;
}

type StatusFilter = 'all' | 'active' | 'pending' | 'other';

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

const OwnerTourList = ({ tours, loadFailed = false }: OwnerTourListProps) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const counts = useMemo(() => {
    const base = { all: tours.length, active: 0, pending: 0, other: 0 };
    for (const tour of tours) {
      const status = (tour.status || '').toLowerCase();
      if (status === 'active') base.active += 1;
      else if (status === 'pending') base.pending += 1;
      else base.other += 1;
    }
    return base;
  }, [tours]);

  const visibleTours = useMemo(() => {
    if (filter === 'all') return tours;
    return tours.filter((tour) => {
      const status = (tour.status || '').toLowerCase();
      if (filter === 'other')
        return status !== 'active' && status !== 'pending';
      return status === filter;
    });
  }, [tours, filter]);

  const filters: { key: StatusFilter; count: number }[] = [
    { key: 'all', count: counts.all },
    { key: 'active', count: counts.active },
    { key: 'pending', count: counts.pending },
    { key: 'other', count: counts.other },
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h${mins}`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
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
            {tours.length === 0
              ? t('ownerTours.tourList.empty')
              : t('ownerTours.tourList.emptyFilter')}
          </p>
          <Link
            to="/owner/boats"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ddms-secondary hover:underline"
          >
            {t('ownerTours.tourList.registerCta')} &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTours.map((tour) => {
            const isActive = (tour.status || '').toLowerCase() === 'active';

            return (
              <div
                key={tour.id}
                className="flex flex-col rounded-xl border border-border bg-muted/20 overflow-hidden hover:border-ddms-secondary/50 transition-colors"
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
    </div>
  );
};

export default OwnerTourList;
