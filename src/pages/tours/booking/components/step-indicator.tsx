import { useTranslation } from 'react-i18next';
import { Calendar, Anchor, DoorOpen, Users, CreditCard } from 'lucide-react';

const STEPS = [
  { num: 1, icon: Calendar, labelKey: 'booking.steps.date' },
  { num: 2, icon: Anchor, labelKey: 'booking.steps.boat' },
  { num: 3, icon: DoorOpen, labelKey: 'booking.steps.rooms' },
  { num: 4, icon: Users, labelKey: 'booking.steps.guests' },
  { num: 5, icon: CreditCard, labelKey: 'booking.steps.confirm' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex items-center gap-2">
      {STEPS.map(({ num, icon: Icon, labelKey }, i) => (
        <div key={num} className="flex flex-1 items-center gap-2">
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: currentStep >= num ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                color: currentStep >= num ? '#112240' : '#ecf0ff',
              }}
            >
              <Icon size={18} />
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: currentStep >= num ? '#ffffff' : '#ecf0ff' }}
            >
              {t(labelKey)}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="mb-5 h-0.5 flex-1"
              style={{ backgroundColor: currentStep > num ? '#00F0FF' : 'rgba(255,255,255,0.15)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
