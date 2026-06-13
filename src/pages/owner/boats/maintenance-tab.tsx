import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Wrench,
  Settings,
  AlertTriangle,
  Droplets,
  User,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { boatService, type BoatMaintenance } from '@/services/boatService';
import api from '@/services/api';

interface PortMaintenanceService {
  id: string;
  name: string;
  iconCode: string;
  price: number | null;
  description: string | null;
}

interface MaintenanceRegistration {
  serviceId: string;
  scheduledDate: string;
}

const getIconComponent = (code: string) => {
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

interface MaintenanceTabProps {
  boatId?: string;
  maintenances: BoatMaintenance[];
  onChange: (maintenances: BoatMaintenance[]) => void;
  selectedServices: MaintenanceRegistration[];
  onSelectedServicesChange: (services: MaintenanceRegistration[]) => void;
}

export default function MaintenanceTab({
  boatId,
  maintenances,
  onChange,
  selectedServices,
  onSelectedServicesChange,
}: MaintenanceTabProps) {
  const { t } = useTranslation();
  const [portServices, setPortServices] = useState<PortMaintenanceService[]>(
    [],
  );
  const [loadingServices, setLoadingServices] = useState(true);

  // Date-picker Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/owner/maintenance-services');
        if (res.data.isSuccess) {
          setPortServices(res.data.result || []);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh mục dịch vụ bảo trì', error);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handleDelete = async (m: BoatMaintenance) => {
    if (!boatId) return;
    try {
      await boatService.deleteOwnerMaintenance(boatId, m.id);
      onChange(maintenances.filter((x) => x.id !== m.id));
      toast.success('Đã hủy lịch bảo trì');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Hủy thất bại');
    }
  };

  const handleCardClick = (serviceId: string) => {
    const existing = selectedServices.find((s) => s.serviceId === serviceId);
    setActiveServiceId(serviceId);
    if (existing) {
      const [d, t] = existing.scheduledDate.split('T');
      setSelectedDate(d || '');
      setSelectedTime(t ? t.substring(0, 5) : '09:00');
    } else {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedTime('09:00');
    }
    setIsModalOpen(true);
  };

  const handleConfirmDate = () => {
    if (!activeServiceId || !selectedDate) return;
    const datetimeStr = `${selectedDate}T${selectedTime}:00`;

    const exists = selectedServices.some(
      (s) => s.serviceId === activeServiceId,
    );
    if (exists) {
      onSelectedServicesChange(
        selectedServices.map((s) =>
          s.serviceId === activeServiceId
            ? { ...s, scheduledDate: datetimeStr }
            : s,
        ),
      );
    } else {
      onSelectedServicesChange([
        ...selectedServices,
        { serviceId: activeServiceId, scheduledDate: datetimeStr },
      ]);
    }
    setIsModalOpen(false);
    toast.success('Đã lưu ngày giờ dự kiến bảo trì');
  };

  const handleDeselect = () => {
    if (!activeServiceId) return;
    onSelectedServicesChange(
      selectedServices.filter((s) => s.serviceId !== activeServiceId),
    );
    setIsModalOpen(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold border border-yellow-500/30">
            Chờ duyệt
          </span>
        );
      case 'approved':
      case 'approve':
        return (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30">
            Từ chối
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-500/30">
            Không rõ
          </span>
        );
    }
  };

  return (
    <div className="space-y-10">
      {/* Phần 1: Đăng ký dịch vụ mới */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
            Đăng ký Dịch vụ từ Siêu Cảng Marina
          </h2>
          {selectedServices.length > 0 && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-bold border border-cyan-500/30">
              Đã chọn {selectedServices.length} dịch vụ
            </span>
          )}
        </div>

        {loadingServices ? (
          <div className="text-slate-400 text-sm p-4 bg-slate-800/30 rounded-xl border border-slate-700">
            Đang tải danh mục dịch vụ...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {portServices.map((srv) => {
              const reg = selectedServices.find((s) => s.serviceId === srv.id);
              const isSelected = !!reg;
              const IconComp = getIconComponent(srv.iconCode);

              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleCardClick(srv.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center gap-2 min-h-[170px]
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
                  {srv.price && (
                    <span
                      className={`text-xs ${isSelected ? 'text-cyan-500' : 'text-slate-500'}`}
                    >
                      {srv.price.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                  {reg && (
                    <span className="text-[10px] text-cyan-400 mt-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                      {new Date(reg.scheduledDate).toLocaleDateString('vi-VN')}{' '}
                      {new Date(reg.scheduledDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-4 italic">
          * Nhấn vào dịch vụ để thiết lập ngày sửa chữa. Dịch vụ sẽ được đăng ký
          khi bạn nhấn "Lưu tất cả" ở góc trên bên phải.
        </p>
      </div>

      <div className="h-px bg-slate-800/80 w-full" />

      {/* Phần 2: Lịch sử bảo trì */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
            {t('ownerBoats.form.maintenance.title')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            disabled={!boatId}
          >
            <Plus size={14} />
            {t('ownerBoats.form.maintenance.add')} (Thủ công)
          </Button>
        </div>

        {maintenances.length === 0 ? (
          <div
            className="flex flex-col items-center rounded-2xl py-12 text-center"
            style={{
              backgroundColor: '#112240',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <Wrench size={36} style={{ color: 'rgba(245,158,11,0.3)' }} />
            <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
              {t('ownerBoats.form.maintenance.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {maintenances.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl p-3 border border-slate-800/50 bg-[#112240]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      {m.portMaintenanceServiceName ||
                        m.reason ||
                        t('ownerBoats.form.maintenance.default')}
                    </p>
                    {m.portMaintenanceServiceId && getStatusBadge(m.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Thời gian:{' '}
                    {new Date(m.startTime).toLocaleString('vi-VN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(m)}
                  className="rounded-lg p-1.5 hover:bg-white/5"
                >
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0B132B] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedServices.some((s) => s.serviceId === activeServiceId)
                ? 'Chỉnh sửa lịch sửa chữa'
                : 'Đăng ký lịch sửa chữa'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Ngày diễn ra
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-[#111C3A] px-3 py-2.5 text-sm text-white focus:border-cyan-400 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-[#111C3A] px-3 py-2.5 text-sm text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {selectedServices.some(
                (s) => s.serviceId === activeServiceId,
              ) && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeselect}
                  className="mr-auto"
                >
                  Hủy đăng ký
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setIsModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                variant="cyan"
                type="button"
                disabled={!selectedDate}
                onClick={handleConfirmDate}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
