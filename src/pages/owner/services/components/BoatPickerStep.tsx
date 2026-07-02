import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import type { BoatListItem } from '@/services/boatService';

interface BoatPickerStepProps {
  boats: BoatListItem[];
  selectedBoat: BoatListItem | null;
  loading: boolean;
  onSelectBoat: (boat: BoatListItem) => void;
}

const generateSlots = () => {
  const slots = [];
  for (let i = 0; i < 8; i++) {
    slots.push({ id: `A${i + 1}`, pier: 'Cầu tàu A (Top)' });
    slots.push({ id: `A${i + 9}`, pier: 'Cầu tàu A (Bottom)' });
  }
  for (let i = 0; i < 8; i++) {
    slots.push({ id: `B${i + 1}`, pier: 'Cầu tàu B (Top)' });
    slots.push({ id: `B${i + 9}`, pier: 'Cầu tàu B (Bottom)' });
  }
  return slots;
};

const ALL_SLOTS = generateSlots();

const BoatPickerStep = ({
  boats,
  selectedBoat,
  loading,
  onSelectBoat,
}: BoatPickerStepProps) => {
  const { t } = useTranslation();

  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-ddms-secondary text-white flex items-center justify-center font-black text-sm">
            1
          </span>
          {t('maintenanceServices.step1')}
        </h2>
        <span className="text-xs text-muted-foreground italic">
          {t('maintenanceServices.boatsCount', { count: boats.length })}
        </span>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm p-4 bg-muted rounded-xl border border-border">
          {t('maintenanceServices.loadingBoats')}
        </div>
      ) : boats.length === 0 ? (
        <div className="text-amber-600 dark:text-amber-400 text-sm p-4 border border-amber-500/20 bg-amber-500/10 rounded-xl">
          {t('maintenanceServices.emptyBoats')}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {boats.map((boat) => {
            const isSelected = selectedBoat?.id === boat.id;
            const statusConfig: Record<
              string,
              { text: string; color: string }
            > = {
              idle: {
                text: t('maintenanceServices.boatStatus.idle'),
                color:
                  'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
              },
              maintenance: {
                text: t('maintenanceServices.boatStatus.maintenance'),
                color:
                  'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
              },
              broken: {
                text: t('maintenanceServices.boatStatus.broken'),
                color:
                  'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400',
              },
              in_use: {
                text: t('maintenanceServices.boatStatus.in_use'),
                color:
                  'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400',
              },
            };
            const sc = statusConfig[boat.status] || statusConfig.idle;
            const mockSlot = ALL_SLOTS[
              boats.findIndex((b) => b.id === boat.id) % ALL_SLOTS.length
            ] || { pier: t('maintenanceServices.notDocked'), id: '' };

            return (
              <button
                key={boat.id}
                type="button"
                onClick={() => onSelectBoat(boat)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'border-ddms-secondary bg-ddms-secondary/5 shadow-[0_0_15px_rgba(0,150,199,0.08)] ring-1 ring-ddms-secondary/30'
                    : 'border-border bg-ddms-bg-card hover:bg-muted/30 hover:border-border'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden border border-border shrink-0">
                    {boat.thumbnailUrl ? (
                      <img
                        src={boat.thumbnailUrl}
                        alt={boat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xs">
                        NO IMG
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold truncate text-base text-foreground">
                        {boat.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ml-2 ${sc.color}`}
                      >
                        {sc.text}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-ddms-secondary mb-3">
                      {boat.type?.toUpperCase()} • #
                      {boat.id.substring(0, 6).toUpperCase()}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                      <MapPin className="w-3.5 h-3.5 text-ddms-secondary" />
                      <span className="truncate">
                        {t('maintenanceServices.pierSlot', {
                          pier: mockSlot.pier,
                          slot: mockSlot.id,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-r from-ddms-secondary/0 via-ddms-secondary/0 to-ddms-secondary/0 group-hover:via-ddms-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BoatPickerStep;
