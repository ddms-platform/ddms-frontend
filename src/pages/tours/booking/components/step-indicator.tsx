import { useTranslation } from 'react-i18next';
import { Calendar, DoorOpen, Users, CreditCard } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  hasRooms: boolean;
}

export default function StepIndicator({
  currentStep,
  hasRooms,
}: StepIndicatorProps) {
  const { t } = useTranslation();

  const steps = [
    {
      num: 1,
      icon: Calendar,
      labelKey: 'booking.steps.date',
      labelFallback: 'Giờ di chuyển',
    },
    ...(hasRooms
      ? [
          {
            num: 2,
            icon: DoorOpen,
            labelKey: 'booking.steps.rooms',
            labelFallback: 'Chọn phòng',
          },
        ]
      : []),
    {
      num: hasRooms ? 3 : 2,
      icon: Users,
      labelKey: 'booking.steps.guests',
      labelFallback: 'Số khách',
    },
    {
      num: hasRooms ? 4 : 3,
      icon: CreditCard,
      labelKey: 'booking.steps.confirm',
      labelFallback: 'Xác nhận',
    },
  ];

  return (
    <div className="mt-8 flex items-center gap-2">
      {steps.map(({ num, icon: Icon, labelKey, labelFallback }, i) => (
        <div key={num} className="flex flex-1 items-center gap-2">
          <div className="flex flex-1 flex-col items-center gap-1.5 font-sans">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm"
              style={{
                backgroundColor:
                  currentStep >= num ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                color: currentStep >= num ? '#112240' : '#ecf0ff',
              }}
            >
              <Icon size={18} />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: currentStep >= num ? '#ffffff' : '#94a3b8' }}
            >
              {t(labelKey, labelFallback)}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="mb-5 h-0.5 flex-1"
              style={{
                backgroundColor:
                  currentStep > num ? '#00F0FF' : 'rgba(255,255,255,0.15)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
