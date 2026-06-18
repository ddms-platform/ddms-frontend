import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  AlertTriangle,
  Droplets,
  User,
  Zap,
  Info,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  boatService,
  type BoatListItem,
  type MaintenanceService,
} from '@/services/boatService';

const getIconComponent = (code: string) => {
  switch (code) {
    case 'Settings':
      return Settings;
    case 'AlertTriangle':
      return AlertTriangle;
    case 'Droplets':
      return Droplets;
    case 'User':
      return User; // Or use Droplets for "Vệ sinh" if desired, but user/person icon was in screenshot
    case 'Zap':
      return Zap;
    default:
      return Settings;
  }
};

// Generate 32 slots matching Dock Map
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
    <div className="min-h-screen bg-[#0B132B] p-6 lg:p-8 font-sans text-slate-100 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {t('maintenanceServices.title')}
          </h1>
          <p className="text-sm text-slate-400">
            {t('maintenanceServices.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content (Left Col) */}
          <div className="space-y-10">
            {/* Step 1: Select Boat */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-cyan-500 text-[#0B132B] flex items-center justify-center font-black text-sm">
                    1
                  </span>
                  {t('maintenanceServices.step1')}
                </h2>
                <span className="text-xs text-slate-400 italic">
                  {t('maintenanceServices.boatsCount', { count: boats.length })}
                </span>
              </div>

              {loadingBoats ? (
                <div className="text-slate-400 text-sm p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                  {t('maintenanceServices.loadingBoats')}
                </div>
              ) : boats.length === 0 ? (
                <div className="text-amber-400 text-sm p-4 border border-amber-500/20 bg-amber-500/10 rounded-xl">
                  {t('maintenanceServices.emptyBoats')}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {boats.map((boat) => {
                    const isSelected = selectedBoat?.id === boat.id;
                    const statusConfig = {
                      idle: {
                        text: t('maintenanceServices.boatStatus.idle'),
                        color:
                          'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
                      },
                      maintenance: {
                        text: t('maintenanceServices.boatStatus.maintenance'),
                        color:
                          'text-yellow-400 bg-yellow-400/10 border-yellow-500/30',
                      },
                      broken: {
                        text: t('maintenanceServices.boatStatus.broken'),
                        color: 'text-red-400 bg-red-400/10 border-red-500/30',
                      },
                      in_use: {
                        text: t('maintenanceServices.boatStatus.in_use'),
                        color:
                          'text-blue-400 bg-blue-400/10 border-blue-500/30',
                      },
                    };
                    const sc =
                      statusConfig[boat.status as keyof typeof statusConfig] ||
                      statusConfig['idle'];
                    const mockSlot = ALL_SLOTS[
                      boats.findIndex((b) => b.id === boat.id) %
                        ALL_SLOTS.length
                    ] || { pier: t('maintenanceServices.notDocked'), id: '' };

                    return (
                      <button
                        key={boat.id}
                        type="button"
                        onClick={() => setSelectedBoat(boat)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group 
                          ${
                            isSelected
                              ? 'border-cyan-400 bg-[#111C3A] shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/50'
                              : 'border-slate-800/80 bg-[#111C3A]/50 hover:bg-[#111C3A] hover:border-slate-700'
                          }`}
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/50 shrink-0">
                            {boat.thumbnailUrl ? (
                              <img
                                src={boat.thumbnailUrl}
                                alt={boat.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs">
                                NO IMG
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3
                                className={`font-bold truncate text-base ${isSelected ? 'text-cyan-50' : 'text-slate-100'}`}
                              >
                                {boat.name}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ml-2 ${sc.color}`}
                              >
                                {sc.text}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-cyan-500/70 mb-3">
                              {boat.type?.toUpperCase()} • #
                              {boat.id.substring(0, 6).toUpperCase()}
                            </p>

                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-auto">
                              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                              <span className="truncate">
                                {t('maintenanceServices.pierSlot', {
                                  pier: mockSlot.pier,
                                  slot: mockSlot.id,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:via-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 2: Select Services */}
            <section
              className={`transition-all duration-500 ${!selectedBoat ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}
            >
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${selectedBoat ? 'bg-cyan-500 text-[#0B132B]' : 'bg-slate-800 text-slate-500'}`}
                  >
                    2
                  </span>
                  {t('maintenanceServices.step2')}
                </h2>
              </div>

              {loadingServices ? (
                <div className="text-slate-400 text-sm p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                  {t('maintenanceServices.loadingServices')}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {maintenanceServices.map((srv) => {
                    const isSelected = selectedServiceIds.includes(srv.id);
                    const IconComp = getIconComponent(srv.iconCode);

                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => toggleService(srv.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-4
                          ${
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
          </div>

          {/* Right Col: Sticky Summary */}
          <div className="relative">
            <div className="sticky top-8 space-y-6">
              {/* Summary Card */}
              <div className="bg-linear-to-b from-[#111C3A] to-[#0A1128] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">
                {/* Decorative top glow */}
                <div className="h-1 w-full bg-linear-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0" />

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">
                    {t('maintenanceServices.summaryTitle')}
                  </h3>

                  {/* Selected Boat Info */}
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

                  {/* Selected Services Info */}
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
                          const srv = maintenanceServices.find(
                            (s) => s.id === id,
                          );
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

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-800 mb-8">
                    <p className="text-slate-400 text-sm mb-1">
                      {t('maintenanceServices.totalEstimate')}
                    </p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {calculateTotal().toLocaleString('vi-VN')}đ
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0B132B] font-bold py-6 text-base rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
                      disabled={
                        !selectedBoat || selectedServiceIds.length === 0
                      }
                      onClick={handleRegister}
                    >
                      {t('maintenanceServices.confirmBtn')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 py-6 text-base rounded-xl"
                      onClick={() => {
                        setSelectedBoat(null);
                        setSelectedServiceIds([]);
                      }}
                    >
                      {t('maintenanceServices.cancelBtn')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Support Card */}
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
        </div>
      </div>
    </div>
  );
}
