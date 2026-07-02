import { useTranslation } from 'react-i18next';
import { Settings, AlertTriangle, Droplets, User, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MaintenanceService } from '@/services/boatService';

interface ServicePickerStepProps {
  services: MaintenanceService[];
  selectedServiceIds: string[];
  loading: boolean;
  hasSelectedBoat: boolean;
  onToggleService: (id: string) => void;
}

const getIconComponent = (code: string): LucideIcon => {
  switch (code) {
    case 'Settings':
      return Settings;
    case 'AlertTriangle':
      return AlertTriangle;
    case 'Droplets':
      return Droplets;
    case 'User':
      return User;
    case 'Zap':
      return Zap;
    default:
      return Settings;
  }
};

const ServicePickerStep = ({
  services,
  selectedServiceIds,
  loading,
  hasSelectedBoat,
  onToggleService,
}: ServicePickerStepProps) => {
  const { t } = useTranslation();

  return (
    <section
      className={`transition-all duration-500 ${!hasSelectedBoat ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${hasSelectedBoat ? 'bg-ddms-secondary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            2
          </span>
          {t('maintenanceServices.step2')}
        </h2>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm p-4 bg-muted rounded-xl border border-border">
          {t('maintenanceServices.loadingServices')}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((srv) => {
            const isSelected = selectedServiceIds.includes(srv.id);
            const IconComp = getIconComponent(srv.iconCode);

            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => onToggleService(srv.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-4 cursor-pointer ${
                  isSelected
                    ? 'border-ddms-secondary bg-ddms-secondary/10 text-ddms-secondary shadow-md shadow-ddms-secondary/5'
                    : 'border-border bg-ddms-bg-card text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                <div
                  className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-ddms-secondary/20' : 'bg-muted'}`}
                >
                  <IconComp
                    className={`w-8 h-8 ${isSelected ? 'text-ddms-secondary' : 'text-muted-foreground'}`}
                  />
                </div>
                <span
                  className={`text-sm font-bold leading-tight ${isSelected ? 'text-ddms-secondary' : 'text-foreground/80'}`}
                >
                  {srv.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ServicePickerStep;
