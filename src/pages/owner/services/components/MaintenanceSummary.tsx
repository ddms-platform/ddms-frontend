import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BoatListItem, MaintenanceService } from '@/services/boatService';

interface MaintenanceSummaryProps {
  selectedBoat: BoatListItem | null;
  selectedServiceIds: string[];
  services: MaintenanceService[];
  total: number;
  formatPrice: (p: number | null) => string;
  onRegister: () => void;
  onClear: () => void;
}

const MaintenanceSummary = ({
  selectedBoat,
  selectedServiceIds,
  services,
  total,
  formatPrice,
  onRegister,
  onClear,
}: MaintenanceSummaryProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="sticky top-8 space-y-6">
        <div className="bg-linear-to-b from-[#111C3A] to-[#0A1128] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0" />

          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              {t('maintenanceServices.summaryTitle')}
            </h3>

            <div className="mb-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
                {t('maintenanceServices.selectedBoat')}
              </p>
              {selectedBoat ? (
                <div className="flex gap-3 items-center bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-10 h-10 rounded-lg bg-[#0B132B] border border-slate-700 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">
                      {selectedBoat.name}
                    </p>
                    <p className="text-[10px] font-mono text-cyan-500/70 truncate">
                      {selectedBoat.type?.toUpperCase()} • #
                      {selectedBoat.id.substring(0, 6).toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic py-2">
                  {t('maintenanceServices.noBoatSelected')}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  {t('maintenanceServices.servicesCount', {
                    count: selectedServiceIds.length
                      .toString()
                      .padStart(2, '0'),
                  })}
                </p>
              </div>

              {selectedServiceIds.length > 0 ? (
                <ul className="space-y-3">
                  {selectedServiceIds.map((id) => {
                    const srv = services.find((s) => s.id === id);
                    if (!srv) return null;
                    return (
                      <li
                        key={id}
                        className="flex justify-between items-start text-sm"
                      >
                        <div className="flex gap-2">
                          <span className="text-cyan-50 mt-0.5">✓</span>
                          <span className="text-slate-300 pr-2">
                            {srv.name}
                          </span>
                        </div>
                        <span className="font-mono text-slate-400 whitespace-nowrap">
                          {formatPrice(srv.price)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-sm text-slate-500 italic py-2 border-t border-slate-800/50">
                  {t('maintenanceServices.noServicesSelected')}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mb-8">
              <p className="text-slate-400 text-sm mb-1">
                {t('maintenanceServices.totalEstimate')}
              </p>
              <p className="text-3xl font-bold text-cyan-400">
                {total.toLocaleString('vi-VN')}đ
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0B132B] font-bold py-6 text-base rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
                disabled={!selectedBoat || selectedServiceIds.length === 0}
                onClick={onRegister}
              >
                {t('maintenanceServices.confirmBtn')}
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 py-6 text-base rounded-xl"
                onClick={onClear}
              >
                {t('maintenanceServices.cancelBtn')}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[#111C3A]/50 rounded-2xl border border-slate-800/50 p-5 flex gap-4 items-start">
          <div className="mt-1 shrink-0 text-cyan-500">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-1">
              {t('maintenanceServices.supportTitle')}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('maintenanceServices.supportDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSummary;
