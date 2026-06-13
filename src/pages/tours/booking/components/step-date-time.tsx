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
      // Filter scheduled slots starting in the future (or all scheduled slots for flexibility)
      const futureSchedules = schedules.filter((s) => s.status === 'scheduled');
      if (futureSchedules.length > 0) return futureSchedules;
    }

    // Fallback mock schedules if database has none
    const mocks: any[] = [];
    const now = new Date();
    for (let i = 1; i <= 6; i++) {
      const day = new Date();
      day.setDate(now.getDate() + i);
      const times = [
        { start: '08:00', end: '10:00' },
        { start: '14:30', end: '16:30' },
        { start: '18:00', end: '20:00' },
        { start: '20:30', end: '22:30' },
      ];
      times.forEach((timeStr, idx) => {
        const startStr = `${day.toISOString().split('T')[0]}T${timeStr.start}:00`;
        const endStr = `${day.toISOString().split('T')[0]}T${timeStr.end}:00`;
        mocks.push({
          id: `mock-schedule-${i}-${idx}`,
          tour_id: 'mock-tour',
          boat_id: 'mock-boat',
          boatName: 'Du thuyền Hoàng Gia',
          start_time: startStr,
          end_time: endStr,
          maxCapacity: 45,
          status: 'scheduled',
        });
      });
    }
    return mocks;
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
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        {t('booking.dateTime.title', 'Chọn ngày và giờ khởi hành')}
      </h2>
      <p className="mt-1 text-sm text-gray-400">
        {t(
          'booking.dateTime.subtitle',
          'Chọn ngày khởi hành và khung giờ di chuyển phù hợp cho chuyến du ngoạn của bạn',
        )}
      </p>

      {/* Date Selector Row */}
      <div className="mt-6">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#00F0FF]">
          1. {t('booking.dateTime.selectDate', 'Chọn ngày di chuyển')}
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {sortedDates.map((dateStr) => {
            const isActive = activeDate === dateStr;
            const { weekday, dayNum, month } = getDayLabel(dateStr);
            return (
              <button
                key={dateStr}
                onClick={() => setActiveDate(dateStr)}
                className="flex min-w-17.5 flex-col items-center rounded-xl border py-2.5 transition-all active:scale-95"
                style={{
                  borderColor: isActive ? '#00F0FF' : 'rgba(255,255,255,0.1)',
                  backgroundColor: isActive
                    ? 'rgba(0,240,255,0.08)'
                    : '#0d1b36',
                }}
              >
                <span className="text-[10px] font-bold text-gray-400">
                  {weekday}
                </span>
                <span
                  className="text-lg font-extrabold my-0.5"
                  style={{ color: isActive ? '#00F0FF' : '#ffffff' }}
                >
                  {dayNum}
                </span>
                <span className="text-[10px] text-gray-400">{month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Selection Row */}
      {activeDate && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#00F0FF]">
              2. {t('booking.dateTime.selectTime', 'Chọn giờ khởi hành')}
            </label>
            <span className="text-xs text-gray-400 font-medium">
              {formatDateHeader(activeDate)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
                  className="flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all active:scale-[0.99] hover:border-[#00F0FF]/40"
                  style={{
                    borderColor: isSelected
                      ? '#00F0FF'
                      : 'rgba(255,255,255,0.08)',
                    backgroundColor: isSelected
                      ? 'rgba(0,240,255,0.05)'
                      : '#0d1b36',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(0,240,255,0.15)'
                        : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Clock
                      size={18}
                      style={{ color: isSelected ? '#00F0FF' : '#94a3b8' }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-base font-bold"
                      style={{ color: isSelected ? '#00F0FF' : '#ffffff' }}
                    >
                      {formattedTime}
                    </p>
                    {sched.boatName && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                        <Ship size={10} />
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
