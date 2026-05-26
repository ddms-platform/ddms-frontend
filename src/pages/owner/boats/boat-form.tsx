import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Ship,
  DoorOpen,
  Layers,
  ImageIcon,
  Wrench,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BOAT_TYPES } from '@/data/owner-boats';
import { boatService, type Boat, type BoatMaintenance } from '@/services/boatService';
import { cabinService, type CreateCabinDto } from '@/services/cabinService';
import { boatServiceApi, type CreateServiceDto } from '@/services/boatServiceApi';

type Tab = 'basic' | 'cabins' | 'services' | 'images' | 'maintenance';

interface LocalCabin extends CreateCabinDto {
  _localId: string;
  id?: string; // set if already saved
}

interface LocalService extends CreateServiceDto {
  _localId: string;
  id?: string;
}

export default function BoatForm() {
  const { t } = useTranslation();
  const { boatId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!boatId;

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loadingBoat, setLoadingBoat] = useState(isEdit);

  // Basic info
  const [name, setName] = useState('');
  const [type, setType] = useState('standard');
  const [maxPassengers, setMaxPassengers] = useState('');
  const [status, setStatus] = useState('idle');

  // Cabins & services (local state, sync via API on save)
  const [cabins, setCabins] = useState<LocalCabin[]>([]);
  const [services, setServices] = useState<LocalService[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing boat if editing
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
      setCabins(
        b.cabins.map((c) => ({
          _localId: c.id,
          id: c.id,
          name: c.name,
          capacity: c.capacity,
          price: c.price,
          totalRooms: c.totalRooms,
          description: c.description,
        }))
      );
      setServices(
        b.services.map((s) => ({
          _localId: s.id,
          id: s.id,
          name: s.name,
          price: s.price,
          description: s.description,
          isActive: s.isActive,
        }))
      );
    } catch {
      alert('Không thể tải thông tin tàu');
    } finally {
      setLoadingBoat(false);
    }
  }, [boatId]);

  useEffect(() => {
    loadBoat();
  }, [loadBoat]);

  // Cabin handlers
  const addCabin = () =>
    setCabins((prev) => [
      ...prev,
      { _localId: `new-c-${Date.now()}`, name: '', capacity: 2, price: 0, totalRooms: 1 },
    ]);
  const updateCabin = (idx: number, field: keyof LocalCabin, value: string | number) =>
    setCabins((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  const removeCabin = (idx: number) => setCabins((prev) => prev.filter((_, i) => i !== idx));

  // Service handlers
  const addService = () =>
    setServices((prev) => [
      ...prev,
      { _localId: `new-s-${Date.now()}`, name: '', price: 0, isActive: true },
    ]);
  const updateService = (
    idx: number,
    field: keyof LocalService,
    value: string | number | boolean
  ) => setServices((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  const removeService = (idx: number) => setServices((prev) => prev.filter((_, i) => i !== idx));

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

      // 1. Save / update boat basic info
      if (isEdit && boatId) {
        await boatService.update(boatId, {
          name,
          type,
          maxPassengers: Number(maxPassengers),
          status,
        });
      } else {
        const created = await boatService.create({
          name,
          type,
          maxPassengers: Number(maxPassengers),
          status,
        });
        savedBoatId = created.id;
      }

      if (!savedBoatId) throw new Error('Không lấy được ID tàu');

      // 2. Sync cabins — only new ones (id-less)
      for (const cabin of cabins.filter((c) => !c.id)) {
        await cabinService.create(savedBoatId, {
          name: cabin.name,
          capacity: cabin.capacity,
          price: cabin.price,
          totalRooms: cabin.totalRooms,
          description: cabin.description,
        });
      }

      // 3. Sync services — only new ones
      for (const svc of services.filter((s) => !s.id)) {
        await boatServiceApi.create(savedBoatId, {
          name: svc.name,
          price: svc.price,
          description: svc.description,
          isActive: svc.isActive,
        });
      }

      navigate('/owner/boats');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu thất bại, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaintenance = async (m: BoatMaintenance) => {
    if (!boatId) return;
    try {
      await boatService.deleteMaintenance(boatId, m.id);
      setBoat((prev) =>
        prev ? { ...prev, maintenances: prev.maintenances.filter((x) => x.id !== m.id) } : prev
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'basic', label: t('ownerBoats.form.tabs.basic'), icon: Ship },
    { id: 'cabins', label: t('ownerBoats.form.tabs.cabins'), icon: DoorOpen },
    { id: 'services', label: t('ownerBoats.form.tabs.services'), icon: Layers },
    { id: 'images', label: t('ownerBoats.form.tabs.images'), icon: ImageIcon },
    { id: 'maintenance', label: t('ownerBoats.form.tabs.maintenance'), icon: Wrench },
  ];

  const sectionStyle = { backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' };

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
                ? t('ownerBoats.form.editTitle', { name: boat?.name || '' })
                : t('ownerBoats.form.createTitle')}
            </h1>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {isEdit ? t('ownerBoats.form.editSubtitle') : t('ownerBoats.form.createSubtitle')}
            </p>
          </div>
        </div>
        <Button
          variant="cyan"
          size="action"
          className="gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? t('ownerBoats.form.saving') : t('ownerBoats.form.save')}
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="mt-6 flex gap-1 overflow-x-auto rounded-xl p-1"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
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
            {id === 'cabins' && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {cabins.length}
              </span>
            )}
            {id === 'services' && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                {services.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* ── Basic Info ── */}
        {activeTab === 'basic' && (
          <div className="rounded-2xl p-6" style={sectionStyle}>
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
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: errors.name ? '#EF4444' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
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
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
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
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: errors.maxPassengers ? '#EF4444' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                />
                {errors.maxPassengers && (
                  <p className="mt-1 text-xs text-red-400">{errors.maxPassengers}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-lg border px-4 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                >
                  <option value="idle">Đang nghỉ</option>
                  <option value="running">Đang hoạt động</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Cabins ── */}
        {activeTab === 'cabins' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.cabins.count', { count: String(cabins.length) })}
              </p>
              <Button variant="cyan" size="sm" className="gap-1.5" onClick={addCabin}>
                <Plus size={14} />
                {t('ownerBoats.form.cabins.add')}
              </Button>
            </div>
            {cabins.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={sectionStyle}>
                <DoorOpen size={40} className="mx-auto" style={{ color: 'rgba(0,240,255,0.3)' }} />
                <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.cabins.empty')}
                </p>
              </div>
            ) : (
              cabins.map((cabin, idx) => (
                <div key={cabin._localId} className="rounded-2xl p-4" style={sectionStyle}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} style={{ color: '#ecf0ff' }} />
                      <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                        {t('ownerBoats.form.cabins.label', { index: String(idx + 1) })}
                        {cabin.id && (
                          <span className="ml-2 text-[10px] font-normal text-green-400">
                            ✓ Đã lưu
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => removeCabin(idx)}
                      className="rounded-lg p-1.5 hover:bg-white/5"
                    >
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: t('ownerBoats.form.cabins.name'),
                        field: 'name' as const,
                        type: 'text',
                        value: cabin.name,
                      },
                      {
                        label: t('ownerBoats.form.cabins.capacity'),
                        field: 'capacity' as const,
                        type: 'number',
                        value: cabin.capacity,
                      },
                      {
                        label: t('ownerBoats.form.cabins.price'),
                        field: 'price' as const,
                        type: 'number',
                        value: cabin.price,
                      },
                      {
                        label: t('ownerBoats.form.cabins.totalRooms'),
                        field: 'totalRooms' as const,
                        type: 'number',
                        value: cabin.totalRooms,
                      },
                    ].map(({ label, field, type, value }) => (
                      <div key={field}>
                        <label
                          className="mb-1 block text-[11px] font-medium"
                          style={{ color: '#ecf0ff' }}
                        >
                          {label}
                        </label>
                        <Input
                          type={type}
                          value={value}
                          onChange={(e) =>
                            updateCabin(
                              idx,
                              field,
                              type === 'number' ? +e.target.value : e.target.value
                            )
                          }
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Services ── */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.services.count', { count: String(services.length) })}
              </p>
              <Button variant="cyan" size="sm" className="gap-1.5" onClick={addService}>
                <Plus size={14} />
                {t('ownerBoats.form.services.add')}
              </Button>
            </div>
            {services.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={sectionStyle}>
                <Layers size={40} className="mx-auto" style={{ color: 'rgba(0,240,255,0.3)' }} />
                <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.services.empty')}
                </p>
              </div>
            ) : (
              services.map((svc, idx) => (
                <div
                  key={svc._localId}
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={sectionStyle}
                >
                  <div className="grid flex-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.services.name')}
                        {svc.id && <span className="ml-1 text-[10px] text-green-400">✓</span>}
                      </label>
                      <Input
                        value={svc.name}
                        onChange={(e) => updateService(idx, 'name', e.target.value)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-[11px] font-medium"
                        style={{ color: '#ecf0ff' }}
                      >
                        {t('ownerBoats.form.services.price')}
                      </label>
                      <Input
                        type="number"
                        value={svc.price}
                        onChange={(e) => updateService(idx, 'price', +e.target.value)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <label
                        className="flex items-center gap-2 text-xs"
                        style={{ color: '#ecf0ff' }}
                      >
                        <input
                          type="checkbox"
                          checked={svc.isActive}
                          onChange={(e) => updateService(idx, 'isActive', e.target.checked)}
                          className="h-4 w-4 rounded accent-[#00F0FF]"
                        />
                        {t('ownerBoats.form.services.active')}
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(idx)}
                    className="shrink-0 rounded-lg p-1.5 hover:bg-white/5"
                  >
                    <Trash2 size={14} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Images ── */}
        {activeTab === 'images' && (
          <div className="rounded-2xl p-6" style={sectionStyle}>
            <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
              {t('ownerBoats.form.images.title')}
            </h2>
            {boat?.images && boat.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {boat.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-4/3 overflow-hidden rounded-xl"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || ''}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-full p-2 hover:bg-white/20">
                        <Trash2 size={16} style={{ color: '#ffffff' }} />
                      </button>
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                        <p className="text-[11px] text-white">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  className="flex aspect-4/3 flex-col items-center justify-center rounded-xl border-2 border-dashed hover:border-[#00F0FF]/40"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Plus size={24} style={{ color: '#ecf0ff' }} />
                  <span className="mt-1 text-xs" style={{ color: '#ecf0ff' }}>
                    {t('ownerBoats.form.images.add')}
                  </span>
                </button>
              </div>
            ) : (
              <div
                className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed py-12"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <ImageIcon size={40} style={{ color: 'rgba(0,240,255,0.3)' }} />
                <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.images.dragDrop')}
                </p>
                <Button variant="dark-outline" size="sm" className="mt-3">
                  {t('ownerBoats.form.images.select')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Maintenance ── */}
        {activeTab === 'maintenance' && (
          <div className="rounded-2xl p-6" style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
                {t('ownerBoats.form.maintenance.title')}
              </h2>
              <Button variant="cyan" size="sm" className="gap-1.5">
                <Plus size={14} />
                {t('ownerBoats.form.maintenance.add')}
              </Button>
            </div>
            {boat?.maintenances && boat.maintenances.length > 0 ? (
              <div className="mt-4 space-y-3">
                {boat.maintenances.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl p-3"
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.12)',
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                        {m.reason || t('ownerBoats.form.maintenance.default')}
                      </p>
                      <p className="text-xs" style={{ color: '#ecf0ff' }}>
                        {new Date(m.startTime).toLocaleDateString('vi-VN')} →{' '}
                        {new Date(m.endTime).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMaintenance(m)}
                      className="rounded-lg p-1.5 hover:bg-white/5"
                    >
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm" style={{ color: '#ecf0ff' }}>
                {t('ownerBoats.form.maintenance.empty')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
