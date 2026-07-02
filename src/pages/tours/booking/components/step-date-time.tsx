import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Ship } from 'lucide-react';

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

interface StepDateTimeProps {
  schedules: any[];
  selectedSchedule: any | null;
  onSelectSchedule: (schedule: any) => void;
}

export default function StepDateTime({
  schedules,
  selectedSchedule,
  onSelectSchedule,
}: StepDateTimeProps) {
  const { t } = useTranslation();

  // ── 1. Group Schedules (Include mock fallback) ──
  const displaySchedules = useMemo(() => {
    if (schedules && schedules.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Filter scheduled slots starting in the future
      const futureSchedules = schedules.filter((s) => {
        if (s.status !== 'scheduled') return false;
        const d = new Date(s.start_time);
        return d >= now;
      });

      if (futureSchedules.length > 0) return futureSchedules;
    }

    return [];
  }, [schedules]);

  // Group by Date string
  const groupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    displaySchedules.forEach((s) => {
      const d = new Date(s.start_time);
      const dateStr = d.toISOString().split('T')[0];
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(s);
    });
    return groups;
  }, [displaySchedules]);

  // Get unique sorted dates
  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort();
  }, [groupedByDate]);

  // Track active date selection
  const [activeDate, setActiveDate] = useState<string>(() => {
    if (selectedSchedule) {
      return new Date(selectedSchedule.start_time).toISOString().split('T')[0];
    }
    return sortedDates[0] || '';
  });

  const slotsForActiveDate = useMemo(() => {
    return groupedByDate[activeDate] || [];
  }, [groupedByDate, activeDate]);

  // ── Helpers ──
  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      weekday: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: `Th${d.getMonth() + 1}`,
    };
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {t('booking.dateTime.title', 'Chọn ngày và giờ khởi hành')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          'booking.dateTime.subtitle',
          'Chọn ngày khởi hành và khung giờ di chuyển phù hợp cho chuyến du ngoạn của bạn',
        )}
      </p>

      {/* Date Selector Row */}
      <div className="mt-6">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-ddms-secondary">
          1. {t('booking.dateTime.selectDate', 'Chọn ngày di chuyển')}
        </label>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-700">
          {sortedDates.map((dateStr) => {
            const isActive = activeDate === dateStr;
            const { weekday, dayNum, month } = getDayLabel(dateStr);
            return (
              <button
                key={dateStr}
                onClick={() => setActiveDate(dateStr)}
                className={`flex min-w-18 flex-col items-center rounded-2xl border py-3 transition-all duration-300 active:scale-95 cursor-pointer hover:border-ddms-secondary/40 hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-ddms-secondary/10 border-ddms-secondary text-ddms-secondary shadow-sm shadow-ddms-secondary/15'
                    : 'bg-ddms-bg-card border-border text-foreground'
                }`}
              >
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {weekday}
                </span>
                <span className="text-xl font-extrabold my-1 leading-none">
                  {dayNum}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Selection Row */}
      {activeDate && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ddms-secondary">
              2. {t('booking.dateTime.selectTime', 'Chọn giờ khởi hành')}
            </label>
            <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-full border border-border">
              {formatDateHeader(activeDate)}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {slotsForActiveDate.map((sched) => {
              const isSelected = selectedSchedule?.id === sched.id;
              const startTime = new Date(sched.start_time);
              const endTime = new Date(sched.end_time);
              const formattedTime = `${startTime.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })} - ${endTime.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}`;

              return (
                <button
                  key={sched.id}
                  onClick={() => onSelectSchedule(sched)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99] cursor-pointer hover:border-ddms-secondary/40 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'bg-ddms-secondary/10 border-ddms-secondary text-ddms-secondary shadow-sm shadow-ddms-secondary/15 scale-[1.01]'
                      : 'bg-ddms-bg-card border-border text-foreground'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-ddms-secondary/20 border-ddms-secondary/30'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <Clock
                      size={20}
                      className={
                        isSelected
                          ? 'text-ddms-secondary animate-pulse'
                          : 'text-muted-foreground'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-base font-extrabold tracking-tight transition-colors ${isSelected ? 'text-ddms-secondary' : 'text-foreground'}`}
                    >
                      {formattedTime}
                    </p>
                    {sched.boatName && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                        <Ship size={12} className="text-muted-foreground/80" />
                        <span>{sched.boatName}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
