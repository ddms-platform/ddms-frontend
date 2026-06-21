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
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${hasSelectedBoat ? 'bg-cyan-500 text-[#0B132B]' : 'bg-slate-800 text-slate-500'}`}
          >
            2
          </span>
          {t('maintenanceServices.step2')}
        </h2>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm p-4 bg-slate-800/30 rounded-xl border border-slate-700">
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
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-4 ${
                  isSelected
                    ? 'border-cyan-400 bg-[#0F223D] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                    : 'border-slate-800/80 bg-[#111C3A] text-slate-400 hover:border-slate-700 hover:bg-[#132042]'
                }`}
              >
                <div
                  className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-cyan-500/20' : 'bg-slate-800/50'}`}
                >
                  <IconComp
                    className={`w-8 h-8 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}
                  />
                </div>
                <span
                  className={`text-sm font-bold leading-tight ${isSelected ? 'text-cyan-50' : 'text-slate-300'}`}
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
