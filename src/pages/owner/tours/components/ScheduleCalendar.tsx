import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ViewMode = 'month' | 'week' | 'day';

interface ScheduleCalendarProps {
  schedules: any[];
  currentDate: Date;
  currentMonth: number;
  currentYear: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateClick: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const ScheduleCalendar = ({
  schedules,
  currentDate,
  currentMonth,
  currentYear,
  viewMode,
  onViewModeChange,
  onCreateClick,
  onPrev,
  onNext,
}: ScheduleCalendarProps) => {
  const { t, i18n } = useTranslation();

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let startOffset = new Date(currentYear, currentMonth - 1, 1).getDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1;

    for (let i = 0; i < startOffset; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-30 p-2 border-r border-b border-slate-700/50 bg-slate-800/20"
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
          className={`min-h-[120px] p-2 border-r border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${isToday ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : ''}`}
        >
          <div
            className={`text-sm font-semibold mb-2 ${isToday ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            {i.toString().padStart(2, '0')}
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule, idx) => (
              <div
                key={idx}
                className="text-xs px-2 py-1 rounded bg-cyan-900/40 text-cyan-400 border border-cyan-800 truncate"
                title={`${schedule.tourName} - ${schedule.boatName}`}
              >
                {new Date(schedule.startTime).getHours()}h: {schedule.tourName}{' '}
                ({schedule.boatName})
              </div>
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
        <h3 className="text-lg font-medium text-cyan-400">
          {t('ownerTours.calendar.next7DaysTitle')}
        </h3>
        {weekSchedules.length === 0 ? (
          <p className="text-slate-400">
            {t('ownerTours.calendar.noSchedulesNext7Days')}
          </p>
        ) : (
          <div className="grid gap-3">
            {weekSchedules.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 p-3 rounded-lg"
              >
                <div className="text-center min-w-20">
                  <div className="text-sm text-slate-400">
                    {new Date(s.startTime).toLocaleDateString(i18n.language, {
                      weekday: 'short',
                    })}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {new Date(s.startTime).getDate()}
                  </div>
                </div>
                <div className="flex-1 border-l border-slate-600 pl-4">
                  <div className="font-medium text-cyan-400">
                    {s.tourName}{' '}
                    <span className="text-slate-400 text-sm ml-2">
                      ({s.boatName})
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
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
              </div>
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
        <h3 className="text-lg font-medium text-cyan-400">
          {t('ownerTours.calendar.todayTitle', {
            date: currentDate.toLocaleDateString(i18n.language),
          })}
        </h3>
        {daySchedules.length === 0 ? (
          <p className="text-slate-400">
            {t('ownerTours.calendar.noSchedulesToday')}
          </p>
        ) : (
          <div className="grid gap-3">
            {daySchedules.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 p-3 rounded-lg border-l-4 border-l-cyan-500"
              >
                <div className="text-center min-w-20">
                  <div className="text-lg font-bold text-cyan-400">
                    {new Date(s.startTime).toLocaleTimeString(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {s.tourName}{' '}
                    <span className="text-slate-400 text-sm ml-2">
                      {t('ownerTours.recentBookings.boatPrefix', {
                        name: s.boatName,
                      })}
                    </span>
                  </div>
                </div>
              </div>
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
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              title={t('common.prev', 'Trước')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white min-w-55 text-center">
              {t('ownerTours.calendar.title', {
                month: currentMonth,
                year: currentYear,
              })}
            </h2>
            <button
              onClick={onNext}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              title={t('common.next', 'Sau')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {viewModes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${viewMode === mode ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-1.5 rounded-md font-bold transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <Plus size={18} />
            {t('ownerTours.calendar.createTourBtn')}
          </button>
        </div>
      </div>

      <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-[#131c31] min-h-100">
        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-800/50">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-slate-300 border-r border-slate-700/50 last:border-0"
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
