import { useTranslation } from 'react-i18next';
import {
  Calendar,
  DoorOpen,
  Package,
  Users,
  CreditCard,
  Check,
} from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  hasRooms: boolean;
  hasServices: boolean;
}

export default function StepIndicator({
  currentStep,
  hasRooms,
  hasServices,
}: StepIndicatorProps) {
  const { t } = useTranslation();

  const dynamicSteps: {
    icon: typeof Calendar;
    labelKey: string;
    labelFallback: string;
  }[] = [
    {
      icon: Calendar,
      labelKey: 'booking.steps.date',
      labelFallback: 'Giờ di chuyển',
    },
  ];
  if (hasRooms) {
    dynamicSteps.push({
      icon: DoorOpen,
      labelKey: 'booking.steps.rooms',
      labelFallback: 'Chọn phòng',
    });
  }
  if (hasServices) {
    dynamicSteps.push({
      icon: Package,
      labelKey: 'booking.steps.services',
      labelFallback: 'Dịch vụ',
    });
  }
  dynamicSteps.push({
    icon: Users,
    labelKey: 'booking.steps.guests',
    labelFallback: 'Số khách',
  });
  dynamicSteps.push({
    icon: CreditCard,
    labelKey: 'booking.steps.confirm',
    labelFallback: 'Xác nhận',
  });

  const steps = dynamicSteps.map((s, idx) => ({ ...s, num: idx + 1 }));

  return (
    <div className="mt-8 flex items-center justify-between gap-2 max-w-2xl mx-auto">
      {steps.map(({ num, icon: Icon, labelKey, labelFallback }, i) => {
        const isActive = currentStep === num;
        const isCompleted = currentStep > num;

        return (
          <div key={num} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center gap-2 font-sans group">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 shadow-sm border ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/10'
                    : isActive
                      ? 'bg-gradient-to-tr from-ddms-secondary to-cyan-500 border-transparent text-white shadow-md shadow-ddms-secondary/20 scale-105'
                      : 'bg-ddms-bg-card border-border text-muted-foreground hover:border-foreground/20'
                }`}
              >
                {isCompleted ? (
                  <Check
                    size={18}
                    className="animate-in zoom-in-50 duration-300"
                  />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <span
                className={`text-xs font-semibold text-center transition-colors duration-300 ${
                  isActive
                    ? 'text-ddms-secondary font-bold'
                    : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                }`}
              >
                {t(labelKey, labelFallback)}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mb-6 h-0.5 flex-1 bg-border rounded-full overflow-hidden relative min-w-4 sm:min-w-10">
                <div
                  className="absolute left-0 top-0 h-full bg-linear-to-r from-ddms-secondary to-cyan-500 transition-all duration-500 ease-out"
                  style={{
                    width: isCompleted ? '100%' : '0%',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
