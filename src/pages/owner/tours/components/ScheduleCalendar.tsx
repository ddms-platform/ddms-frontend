import { Calendar, Plus, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ViewMode = 'month' | 'week' | 'day';

interface ScheduleCalendarProps {
  schedules: any[];
  currentDate: Date;
  currentMonth: number;
  currentYear: number;
  viewMode: ViewMode;
  isLocked?: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateClick: () => void;
  onScheduleClick?: (schedule: any) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const ScheduleCalendar = ({
  schedules,
  currentDate,
  currentMonth,
  currentYear,
  viewMode,
  isLocked = false,
  onViewModeChange,
  onCreateClick,
  onScheduleClick,
  onPrev,
  onNext,
}: ScheduleCalendarProps) => {
  const { t, i18n } = useTranslation();

  const openSchedule = (schedule: any) => onScheduleClick?.(schedule);

  const scheduleTitle = (schedule: any) =>
    `${schedule.tourName} - ${schedule.boatName}\n${t('ownerTours.calendar.openDetailHint')}`;

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let startOffset = new Date(currentYear, currentMonth - 1, 1).getDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1;

    for (let i = 0; i < startOffset; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-30 p-2 border-r border-b border-border bg-muted/10"
        ></div>,
      );
    }

    const todayDay = currentDate.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const daySchedules = schedules.filter((s) => {
        const d = new Date(s.startTime);
        return d.getDate() === i;
      });

      const isToday = i === todayDay;

      days.push(
        <div
          key={`day-${i}`}
          className={`min-h-[120px] p-2 border-r border-b border-border hover:bg-muted/50 transition-colors ${isToday ? 'ring-2 ring-ddms-secondary bg-ddms-secondary/10' : ''}`}
        >
          <div
            className={`text-sm font-semibold mb-2 ${isToday ? 'text-ddms-secondary' : 'text-muted-foreground'}`}
          >
            {i.toString().padStart(2, '0')}
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => openSchedule(schedule)}
                className="w-full text-left text-xs px-2 py-1 rounded bg-ddms-secondary/20 text-ddms-secondary border border-ddms-secondary/30 truncate font-semibold cursor-pointer hover:bg-ddms-secondary/35 transition-colors"
                title={scheduleTitle(schedule)}
              >
                {new Date(schedule.startTime).getHours()}h: {schedule.tourName}{' '}
                ({schedule.boatName})
              </button>
            ))}
          </div>
        </div>,
      );
    }
    return days;
  };

  const renderWeekView = () => {
    const weekSchedules = schedules
      .filter((s) => {
        const d = new Date(s.startTime);
        return (
          d >= new Date(currentYear, currentMonth - 1, currentDate.getDate()) &&
          d <=
            new Date(currentYear, currentMonth - 1, currentDate.getDate() + 7)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-medium text-ddms-secondary">
          {t('ownerTours.calendar.next7DaysTitle')}
        </h3>
        {weekSchedules.length === 0 ? (
          <p className="text-muted-foreground">
            {t('ownerTours.calendar.noSchedulesNext7Days')}
          </p>
        ) : (
          <div className="grid gap-3">
            {weekSchedules.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => openSchedule(s)}
                title={scheduleTitle(s)}
                className="flex w-full items-center gap-4 bg-muted/40 border border-border p-3 rounded-lg text-left cursor-pointer hover:border-ddms-secondary/50 hover:bg-muted/60 transition-colors"
              >
                <div className="text-center min-w-20">
                  <div className="text-sm text-muted-foreground">
                    {new Date(s.startTime).toLocaleDateString(i18n.language, {
                      weekday: 'short',
                    })}
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {new Date(s.startTime).getDate()}
                  </div>
                </div>
                <div className="flex-1 border-l border-border pl-4">
                  <div className="font-medium text-ddms-secondary">
                    {s.tourName}{' '}
                    <span className="text-muted-foreground text-sm ml-2">
                      ({s.boatName})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(s.startTime).toLocaleTimeString(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(s.endTime).toLocaleTimeString(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDayView = () => {
    const daySchedules = schedules
      .filter((s) => {
        const d = new Date(s.startTime);
        return d.getDate() === currentDate.getDate();
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-medium text-ddms-secondary">
          {t('ownerTours.calendar.todayTitle', {
            date: currentDate.toLocaleDateString(i18n.language),
          })}
        </h3>
        {daySchedules.length === 0 ? (
          <p className="text-muted-foreground">
            {t('ownerTours.calendar.noSchedulesToday')}
          </p>
        ) : (
          <div className="grid gap-3">
            {daySchedules.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => openSchedule(s)}
                title={scheduleTitle(s)}
                className="flex w-full items-center gap-4 bg-muted/40 border border-border p-3 rounded-lg border-l-4 border-l-ddms-secondary text-left cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <div className="text-center min-w-20">
                  <div className="text-lg font-bold text-ddms-secondary">
                    {new Date(s.startTime).toLocaleTimeString(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {s.tourName}{' '}
                    <span className="text-muted-foreground text-sm ml-2">
                      {t('ownerTours.recentBookings.boatPrefix', {
                        name: s.boatName,
                      })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const weekdays = [
    t('ownerTours.calendar.weekdays.monday', 'Thứ 2'),
    t('ownerTours.calendar.weekdays.tuesday', 'Thứ 3'),
    t('ownerTours.calendar.weekdays.wednesday', 'Thứ 4'),
    t('ownerTours.calendar.weekdays.thursday', 'Thứ 5'),
    t('ownerTours.calendar.weekdays.friday', 'Thứ 6'),
    t('ownerTours.calendar.weekdays.saturday', 'Thứ 7'),
    t('ownerTours.calendar.weekdays.sunday', 'Chủ Nhật'),
  ];

  const viewModes: { mode: ViewMode; label: string }[] = [
    { mode: 'month', label: t('ownerTours.calendar.viewMonth') },
    { mode: 'week', label: t('ownerTours.calendar.viewWeek') },
    { mode: 'day', label: t('ownerTours.calendar.viewDay') },
  ];

  return (
    <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-ddms-secondary" />
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              className="p-1 hover:bg-foreground/5 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={t('common.prev', 'Trước')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground min-w-55 text-center">
              {t('ownerTours.calendar.title', {
                month: currentMonth,
                year: currentYear,
              })}
            </h2>
            <button
              onClick={onNext}
              className="p-1 hover:bg-foreground/5 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={t('common.next', 'Sau')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="flex bg-muted rounded-lg p-1">
            {viewModes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${viewMode === mode ? 'bg-ddms-secondary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={onCreateClick}
            disabled={isLocked}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-bold transition-all ${
              isLocked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed opacity-80'
                : 'bg-ddms-secondary hover:bg-ddms-secondary/90 text-white cursor-pointer shadow-md shadow-ddms-secondary/15'
            }`}
          >
            {isLocked ? <Lock size={16} /> : <Plus size={18} />}
            {isLocked
              ? t('ownerTours.calendar.createScheduleLocked')
              : t('ownerTours.calendar.createScheduleBtn')}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-muted/20 min-h-100">
        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 border-b border-border bg-muted/60">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-semibold text-muted-foreground border-r border-border last:border-0"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">{renderCalendarDays()}</div>
          </>
        )}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
