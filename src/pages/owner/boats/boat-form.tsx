import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Ship, DoorOpen, Layers, ImageIcon, Wrench, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BOAT_TYPES } from '@/data/owner-boats';
import { boatService, type Boat, type BoatMaintenance } from '@/services/boatService';
import { cabinService } from '@/services/cabinService';
import { boatServiceApi } from '@/services/boatServiceApi';
import CabinTab, { type LocalCabin } from './cabin-tab';
import ServiceTab, { type LocalService } from './service-tab';
import MaintenanceTab from './maintenance-tab';

type Tab = 'basic' | 'cabins' | 'services' | 'images' | 'maintenance';

export default function BoatForm() {
  const { t } = useTranslation();
  const { boatId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!boatId;

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loadingBoat, setLoadingBoat] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Basic info state
  const [name, setName] = useState('');
  const [type, setType] = useState('standard');
  const [maxPassengers, setMaxPassengers] = useState('');
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Related data state
  const [cabins, setCabins] = useState<LocalCabin[]>([]);
  const [services, setServices] = useState<LocalService[]>([]);
  const [maintenances, setMaintenances] = useState<BoatMaintenance[]>([]);

  const loadBoat = useCallback(async () => {
    if (!boatId) return;
    setLoadingBoat(true);
    try {
      const b = await boatService.getById(boatId);
      setBoat(b);
      setName(b.name);
      setType(b.type ?? 'standard');
      setMaxPassengers(String(b.maxPassengers));
      setStatus(b.status);
      setMaintenances(b.maintenances);
      setCabins(b.cabins.map((c) => ({
        _localId: c.id, id: c.id, name: c.name,
        capacity: c.capacity, price: c.price,
        totalRooms: c.totalRooms, description: c.description,
      })));
      setServices(b.services.map((s) => ({
        _localId: s.id, id: s.id, name: s.name,
        price: s.price, description: s.description, isActive: s.isActive,
      })));
    } catch {
      toast.error('Không thể tải thông tin tàu');
    } finally {
      setLoadingBoat(false);
    }
  }, [boatId]);

  useEffect(() => { loadBoat(); }, [loadBoat]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Tên tàu không được để trống';
    if (!maxPassengers || Number(maxPassengers) < 1) e.maxPassengers = 'Sức chứa phải lớn hơn 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let savedBoatId = boatId;
      const dto = { name, type, maxPassengers: Number(maxPassengers), status };

      if (isEdit && boatId) {
        await boatService.update(boatId, dto);
      } else {
        const created = await boatService.create(dto);
        savedBoatId = created.id;
      }

      if (!savedBoatId) throw new Error('Không lấy được ID tàu');

      // Sync new cabins only
      for (const cabin of cabins.filter((c) => !c.id)) {
        await cabinService.create(savedBoatId, {
          name: cabin.name, capacity: cabin.capacity,
          price: cabin.price, totalRooms: cabin.totalRooms, description: cabin.description,
        });
      }

      // Sync new services only
      for (const svc of services.filter((s) => !s.id)) {
        await boatServiceApi.create(savedBoatId, {
          name: svc.name, price: svc.price,
          description: svc.description, isActive: svc.isActive,
        });
      }

      toast.success(isEdit ? 'Cập nhật tàu thành công' : 'Tạo tàu thành công');
      navigate('/owner/boats');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'basic', label: t('ownerBoats.form.tabs.basic'), icon: Ship },
    { id: 'cabins', label: t('ownerBoats.form.tabs.cabins'), icon: DoorOpen, count: cabins.length },
    { id: 'services', label: t('ownerBoats.form.tabs.services'), icon: Layers, count: services.length },
    { id: 'images', label: t('ownerBoats.form.tabs.images'), icon: ImageIcon },
    { id: 'maintenance', label: t('ownerBoats.form.tabs.maintenance'), icon: Wrench, count: maintenances.length },
  ];

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
  };

  if (loadingBoat) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#00F0FF' }} />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/owner/boats">
              <ArrowLeft size={18} style={{ color: '#ecf0ff' }} />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>
              {isEdit
                ? t('ownerBoats.form.editTitle', { name: boat?.name ?? '' })
                : t('ownerBoats.form.createTitle')}
            </h1>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {isEdit ? t('ownerBoats.form.editSubtitle') : t('ownerBoats.form.createSubtitle')}
            </p>
          </div>
        </div>
        <Button variant="cyan" size="action" className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? t('ownerBoats.form.saving') : t('ownerBoats.form.save')}
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="mt-6 flex gap-1 overflow-x-auto rounded-xl p-1"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: activeTab === id ? 'rgba(0,240,255,0.1)' : 'transparent',
              color: activeTab === id ? '#00F0FF' : '#ecf0ff',
            }}
          >
            <Icon size={16} />
            {label}
            {count !== undefined && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
              {t('ownerBoats.form.basic.title')}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.basic.name')} *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('ownerBoats.form.basic.namePlaceholder')}
                  style={{ ...inputStyle, borderColor: errors.name ? '#EF4444' : 'rgba(255,255,255,0.08)' }}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.basic.type')} *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-11 w-full rounded-lg border px-4 text-sm outline-none"
                  style={inputStyle}
                >
                  {BOAT_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {t(`ownerBoats.types.${bt.value}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.basic.capacity')} *
                </label>
                <Input
                  type="number"
                  value={maxPassengers}
                  onChange={(e) => setMaxPassengers(e.target.value)}
                  placeholder={t('ownerBoats.form.basic.capacityPlaceholder')}
                  style={{ ...inputStyle, borderColor: errors.maxPassengers ? '#EF4444' : 'rgba(255,255,255,0.08)' }}
                />
                {errors.maxPassengers && <p className="mt-1 text-xs text-red-400">{errors.maxPassengers}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-lg border px-4 text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="idle">Đang nghỉ</option>
                  <option value="running">Đang hoạt động</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cabins' && (
          <CabinTab cabins={cabins} onChange={setCabins} />
        )}

        {activeTab === 'services' && (
          <ServiceTab services={services} onChange={setServices} />
        )}

        {activeTab === 'images' && (
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
              {t('ownerBoats.form.images.title')}
            </h2>
            <div
              className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed py-12"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <ImageIcon size={40} style={{ color: 'rgba(0,240,255,0.3)' }} />
              <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.images.dragDrop')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTab
            boatId={boatId}
            maintenances={maintenances}
            onChange={setMaintenances}
          />
        )}
      </div>
    </div>
  );
}
