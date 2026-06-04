import { useTranslation } from 'react-i18next';
import { AVAILABLE_DATES, TIME_SLOTS } from '../mock-data';

interface StepDateTimeProps {
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

export { formatDate };

export default function StepDateTime({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: StepDateTimeProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        {t('booking.dateTime.title')}
      </h2>
      <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
        {t('booking.dateTime.subtitle')}
      </p>

      {/* Date Grid */}
      <div className="mt-6">
        <label
          className="mb-3 block text-sm font-medium"
          style={{ color: '#ffffff' }}
        >
          {t('booking.dateTime.selectDate')}
        </label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {AVAILABLE_DATES.map((date) => (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className="rounded-xl border p-3 text-center text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                borderColor:
                  selectedDate === date ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                backgroundColor:
                  selectedDate === date ? 'rgba(0,240,255,0.08)' : '#112240',
                color: selectedDate === date ? '#00F0FF' : '#ffffff',
              }}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="mt-6">
        <label
          className="mb-3 block text-sm font-medium"
          style={{ color: '#ffffff' }}
        >
          {t('booking.dateTime.selectTime')}
        </label>
        <div className="flex gap-3">
          {TIME_SLOTS.map((time) => (
            <button
              key={time}
              onClick={() => onSelectTime(time)}
              className="flex-1 rounded-xl border py-3 text-center text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                borderColor:
                  selectedTime === time ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                backgroundColor:
                  selectedTime === time ? 'rgba(0,240,255,0.08)' : '#112240',
                color: selectedTime === time ? '#00F0FF' : '#ffffff',
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
