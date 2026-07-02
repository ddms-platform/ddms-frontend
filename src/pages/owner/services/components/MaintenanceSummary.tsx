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
        <div className="bg-ddms-bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-ddms-secondary/0 via-ddms-secondary to-ddms-secondary/0" />

          <div className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">
              {t('maintenanceServices.summaryTitle')}
            </h3>

            <div className="mb-6">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-3">
                {t('maintenanceServices.selectedBoat')}
              </p>
              {selectedBoat ? (
                <div className="flex gap-3 items-center bg-muted/40 p-3 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-lg bg-ddms-bg-owner border border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-ddms-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">
                      {selectedBoat.name}
                    </p>
                    <p className="text-[10px] font-mono text-ddms-secondary truncate">
                      {selectedBoat.type?.toUpperCase()} • #
                      {selectedBoat.id.substring(0, 6).toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic py-2">
                  {t('maintenanceServices.noBoatSelected')}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
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
                          <span className="text-ddms-secondary mt-0.5">✓</span>
                          <span className="text-foreground/80 pr-2">
                            {srv.name}
                          </span>
                        </div>
                        <span className="font-mono text-muted-foreground whitespace-nowrap">
                          {formatPrice(srv.price)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground italic py-2 border-t border-border">
                  {t('maintenanceServices.noServicesSelected')}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mb-8">
              <p className="text-muted-foreground text-sm mb-1">
                {t('maintenanceServices.totalEstimate')}
              </p>
              <p className="text-3xl font-bold text-ddms-secondary">
                {total.toLocaleString('vi-VN')}đ
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-ddms-secondary hover:bg-ddms-secondary/90 text-white font-bold py-6 text-base rounded-xl transition-all cursor-pointer shadow-md shadow-ddms-secondary/20"
                disabled={!selectedBoat || selectedServiceIds.length === 0}
                onClick={onRegister}
              >
                {t('maintenanceServices.confirmBtn')}
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5 py-6 text-base rounded-xl cursor-pointer"
                onClick={onClear}
              >
                {t('maintenanceServices.cancelBtn')}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-ddms-bg-card rounded-2xl border border-border p-5 flex gap-4 items-start shadow-sm">
          <div className="mt-1 shrink-0 text-ddms-secondary">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm mb-1">
              {t('maintenanceServices.supportTitle')}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('maintenanceServices.supportDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSummary;
