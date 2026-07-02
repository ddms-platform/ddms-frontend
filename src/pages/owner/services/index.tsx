import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  boatService,
  type BoatListItem,
  type MaintenanceService,
} from '@/services/boatService';
import BoatPickerStep from './components/BoatPickerStep';
import ServicePickerStep from './components/ServicePickerStep';
import MaintenanceSummary from './components/MaintenanceSummary';

export default function MaintenanceServicesPage() {
  const { t } = useTranslation();
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [maintenanceServices, setMaintenanceServices] = useState<
    MaintenanceService[]
  >([]);
  const [selectedBoat, setSelectedBoat] = useState<BoatListItem | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [boatsRes, servicesRes] = await Promise.all([
          boatService.getOwnerBoats({ pageSize: 100 }),
          boatService.getOwnerMaintenanceServices(),
        ]);

        setBoats(boatsRes.items || []);
        setMaintenanceServices(servicesRes || []);
      } catch (error) {
        console.error(error);
        toast.error(t('maintenanceServices.toast.fetchError'));
      } finally {
        setLoadingBoats(false);
        setLoadingServices(false);
      }
    };

    fetchInitialData();
  }, [t]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return t('maintenanceServices.priceSurvey');
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const calculateTotal = () => {
    let total = 0;
    selectedServiceIds.forEach((id) => {
      const srv = maintenanceServices.find((s) => s.id === id);
      if (srv && srv.price) total += srv.price;
    });
    return total;
  };

  const handleRegister = () => {
    if (!selectedBoat)
      return toast.error(t('maintenanceServices.toast.selectBoatError'));
    if (selectedServiceIds.length === 0)
      return toast.error(t('maintenanceServices.toast.selectServiceError'));

    // TODO: Connect to backend POST API when available
    toast.success(t('maintenanceServices.toast.registerSuccess'));
    setSelectedServiceIds([]);
    setSelectedBoat(null);
  };

  return (
    <div className="min-h-screen bg-ddms-bg-owner p-6 lg:p-8 font-sans text-foreground pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {t('maintenanceServices.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('maintenanceServices.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-10">
            <BoatPickerStep
              boats={boats}
              selectedBoat={selectedBoat}
              loading={loadingBoats}
              onSelectBoat={setSelectedBoat}
            />

            <ServicePickerStep
              services={maintenanceServices}
              selectedServiceIds={selectedServiceIds}
              loading={loadingServices}
              hasSelectedBoat={!!selectedBoat}
              onToggleService={toggleService}
            />
          </div>

          <MaintenanceSummary
            selectedBoat={selectedBoat}
            selectedServiceIds={selectedServiceIds}
            services={maintenanceServices}
            total={calculateTotal()}
            formatPrice={formatPrice}
            onRegister={handleRegister}
            onClear={() => {
              setSelectedBoat(null);
              setSelectedServiceIds([]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
