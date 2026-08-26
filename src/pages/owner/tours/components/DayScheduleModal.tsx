import { CalendarDays, X, Plus, Ship, ExternalLink, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isoToLocalDate } from '@/lib/date-format';
import type { OwnerScheduleListItem } from '@/services/tourService';

interface DayScheduleModalProps {
  open: boolean;
  /** Ngày đang xem, dạng yyyy-MM-dd. */
  dateIso: string | null;
  schedules: OwnerScheduleListItem[];
  isLocked?: boolean;
  onClose: () => void;
  onCreate: (dateIso: string) => void;
  onScheduleClick: (schedule: OwnerScheduleListItem) => void;
}

const SCHEDULE_STATUS_STYLES: Record<string, string> = {
  scheduled:
    'bg-ddms-secondary/15 text-ddms-secondary border-ddms-secondary/30',
  ongoing: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  completed:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
};

const DayScheduleModal = ({
  open,
  dateIso,
  schedules,
  isLocked = false,
  onClose,
  onCreate,
  onScheduleClick,
}: DayScheduleModalProps) => {
  const { t, i18n } = useTranslation();

  if (!open || !dateIso) return null;

  const dayDate = isoToLocalDate(dateIso);
  const dayLabel = dayDate
    ? dayDate.toLocaleDateString(i18n.language, {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : dateIso;

  const sorted = [...schedules].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const timeRange = (schedule: OwnerScheduleListItem) => {
    const opts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    const start = new Date(schedule.startTime).toLocaleTimeString(
      i18n.language,
      opts,
    );
    const end = new Date(schedule.endTime).toLocaleTimeString(
      i18n.language,
      opts,
    );
    return `${start} - ${end}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-ddms-bg-card text-foreground w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-ddms-bg-main/50">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-ddms-secondary" />
            {t('ownerTours.dayModal.title', { date: dayLabel })}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('ownerTours.dayModal.closeBtn')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                {t('ownerTours.dayModal.empty')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('ownerTours.dayModal.emptyHint')}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                {t('ownerTours.dayModal.countLabel', { count: sorted.length })}
              </p>
              <div className="space-y-2">
                {sorted.map((schedule) => {
                  const statusKey = (schedule.status || '').toLowerCase();
                  const statusStyle =
                    SCHEDULE_STATUS_STYLES[statusKey] ??
                    'bg-muted text-muted-foreground border-border';
                  const isTourLive =
                    (schedule.tourStatus || '').toLowerCase() === 'active';

                  return (
                    <div
                      key={schedule.id}
                      className="rounded-lg border border-border bg-muted/25 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-ddms-secondary">
                            {timeRange(schedule)}
                          </div>
                          <div
                            className="text-sm font-semibold text-foreground mt-0.5"
                            title={schedule.tourName}
                          >
                            {schedule.tourName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Ship className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {schedule.boatName}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}
                        >
                          {t(
                            `ownerTours.dayModal.scheduleStatus.${statusKey}`,
                            schedule.status,
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onScheduleClick(schedule)}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-ddms-secondary hover:underline cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isTourLive
                          ? t('ownerTours.tourList.viewPublic')
                          : t('ownerTours.tourList.notPublic')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border bg-ddms-bg-main/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {t('ownerTours.dayModal.closeBtn')}
          </button>
          <button
            onClick={() => onCreate(dateIso)}
            disabled={isLocked}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              isLocked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed opacity-80'
                : 'bg-ddms-primary hover:bg-ddms-primary/90 text-primary-foreground cursor-pointer'
            }`}
          >
            {isLocked ? <Lock size={14} /> : <Plus size={16} />}
            {isLocked
              ? t('ownerTours.calendar.createScheduleLocked')
              : t('ownerTours.dayModal.createBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayScheduleModal;
