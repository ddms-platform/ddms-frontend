import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Ship,
  Layers,
  ImageIcon,
  Wrench,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  boatService,
  type Boat,
  type BoatMaintenance,
} from '@/services/boatService';
import { routeName } from '@/constants/route-name';
import { getBoatTypes, type IBoatType } from '@/services/system-service';
import ServiceTab, {
  type ServiceFormState,
  getEmptyService,
} from './service-tab';
import MaintenanceTab from './maintenance-tab';

type Tab = 'basic' | 'services' | 'maintenance';

export default function BoatForm({
  boatIdProp,
  onClose,
  onSaved,
}: { boatIdProp?: string; onClose?: () => void; onSaved?: () => void } = {}) {
  const { t, i18n } = useTranslation();
  const { boatId: routeBoatId } = useParams();
  const boatId = boatIdProp || routeBoatId;
  const navigate = useNavigate();
  const isEdit = !!boatId;

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loadingBoat, setLoadingBoat] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Basic info state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [boatTypes, setBoatTypes] = useState<IBoatType[]>([]);
  const [maxPassengers, setMaxPassengers] = useState('');
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Related data state
  const [services, setServices] = useState<ServiceFormState[]>([
    getEmptyService(),
  ]);
  const [maintenances, setMaintenances] = useState<BoatMaintenance[]>([]);
  const [selectedMaintenanceServices, setSelectedMaintenanceServices] =
    useState<{ serviceId: string; scheduledDate: string }[]>([]);
  const [boatImages, setBoatImages] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBoatImages((prev) => [
          ...prev,
          {
            base64: base64String,
            imageUrl: URL.createObjectURL(file),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = async (index: number) => {
    const target = boatImages[index];
    if (target.id && boatId) {
      try {
        await boatService.deleteBoatImage(boatId, target.id);
        toast.success('Xóa ảnh thành công');
      } catch (err) {
        toast.error('Không thể xóa ảnh trên máy chủ');
        return;
      }
    }
    setBoatImages((prev) => prev.filter((_, i) => i !== index));
  };

  const loadBoat = useCallback(async () => {
    if (!boatId) return;
    setLoadingBoat(true);
    try {
      const b = await boatService.getOwnerBoatById(boatId);
      setBoat(b);
      setName(b.name);
      setType(b.type ?? '');
      setMaxPassengers(String(b.maxPassengers));
      setStatus(b.status);
      setMaintenances(b.maintenances);
      if (b.images) {
        setBoatImages(b.images);
      }
      // For now, if editing, we might not map existing complex services perfectly if the backend doesn't return combos/rooms here.
      // But we will at least try to populate basic info or keep the empty service
      if (b.services && b.services.length > 0) {
        setServices(
          b.services.map((s) => ({
            ...getEmptyService(),
            id: s.id,
            name: s.name,
            basePrice: String(s.price || 0),
            description: s.description || '',
            serviceType: 'cruise', // Fallback
          })),
        );
      }
    } catch {
      toast.error('Không thể tải thông tin tàu');
    } finally {
      setLoadingBoat(false);
    }
  }, [boatId]);

  useEffect(() => {
    loadBoat();
  }, [loadBoat]);

  useEffect(() => {
    getBoatTypes()
      .then((res) => {
        if (res.data) {
          setBoatTypes(res.data);
          if (!isEdit && res.data.length > 0) {
            setType(res.data[0].code);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load boat types:', err);
      });
  }, [isEdit]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Tên tàu không được để trống';
    if (!maxPassengers || Number(maxPassengers) < 1)
      e.maxPassengers = 'Sức chứa phải lớn hơn 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setActiveTab('basic');
      return;
    }
    setSaving(true);
    try {
      let savedBoatId = boatId;
      const dto = { name, type, maxPassengers: Number(maxPassengers), status };

      if (isEdit && boatId) {
        await boatService.updateByOwner(boatId, dto);
      } else {
        const created = await boatService.createByOwner(dto);
        savedBoatId = created.id;
      }

      if (!savedBoatId) throw new Error('Không lấy được ID tàu');

      // Sync complex services
      const newServices = services.filter((s) => !s.id.includes('-') && s.name); // only save newly created ones that have a name
      if (newServices.length > 0) {
        const payloads = newServices.map((srv) => ({
          boatId: savedBoatId,
          serviceType: srv.serviceType,
          name: srv.name,
          basePrice: parseFloat(srv.basePrice || '0'),
          description: srv.description,
          route: srv.serviceType === 'cruise' ? srv.route : undefined,
          routes:
            srv.serviceType === 'cruise' || srv.serviceType === 'complex_tour'
              ? srv.routes
              : undefined,
          combos:
            srv.serviceType === 'dinner'
              ? srv.combos.map((c) => ({
                  name: c.name,
                  price: parseFloat(c.price || '0'),
                  description: c.description,
                  imageUrl: c.imageUrl,
                }))
              : undefined,
          rooms:
            srv.serviceType === 'cruise' || srv.serviceType === 'complex_tour'
              ? srv.rooms.map((r) => ({
                  name: r.name,
                  capacity: parseInt(r.capacity || '1'),
                  price: parseFloat(r.price || '0'),
                  description: r.description,
                  imageUrl: r.imageUrl,
                }))
              : undefined,
          faqs: srv.faqs,
          equipments:
            srv.serviceType === 'fishing' ? srv.equipments : undefined,
          pricePerDay:
            srv.serviceType === 'speedboat' && srv.pricePerDay
              ? parseFloat(srv.pricePerDay)
              : undefined,
        }));

        await Promise.all(
          payloads.map((payload) =>
            fetch(
              `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/api/owner/services/register`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              },
            ).then((res) => {
              if (!res.ok) throw new Error('Lỗi khi đăng ký dịch vụ');
            }),
          ),
        );
      }

      // Save newly selected images
      const newImages = boatImages.filter((img) => !img.id && img.base64);
      if (newImages.length > 0 && savedBoatId) {
        await Promise.all(
          newImages.map((img) =>
            boatService.uploadBoatImage(savedBoatId, img.base64, ''),
          ),
        );
      }

      // Sync selected maintenance services (if any)
      if (selectedMaintenanceServices.length > 0 && savedBoatId) {
        await boatService.registerPortMaintenances(
          savedBoatId,
          selectedMaintenanceServices,
        );
        setSelectedMaintenanceServices([]);
        if (isEdit) loadBoat();
      }

      toast.success(
        isEdit ? 'Cập nhật tàu thành công' : 'Tạo tàu & dịch vụ thành công',
      );
      if (onSaved) {
        onSaved();
      } else {
        navigate('/owner/boats');
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Lưu thất bại, vui lòng thử lại',
      );
    } finally {
      setSaving(false);
    }
  };

  const TABS: {
    id: Tab;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    { id: 'basic', label: 'Thông tin & Hình ảnh', icon: Ship },
    {
      id: 'services',
      label: 'Dịch vụ của tàu',
      icon: Layers,
      count: services.length,
    },
    {
      id: 'maintenance',
      label: t('ownerBoats.form.tabs.maintenance'),
      icon: Wrench,
      count: maintenances.length,
    },
  ];

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
  };

  if (loadingBoat) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: '#00F0FF' }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose ? (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft size={18} style={{ color: '#ecf0ff' }} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to={routeName.ownerBoats}>
                <ArrowLeft size={18} style={{ color: '#ecf0ff' }} />
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>
              {isEdit
                ? t('ownerBoats.form.editTitle', { name: boat?.name ?? '' })
                : t('ownerBoats.form.createTitle')}
            </h1>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              Cập nhật thông tin, hình ảnh và các dịch vụ của tàu
            </p>
          </div>
        </div>
        <Button
          variant="cyan"
          size="action"
          className="gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Đang lưu...' : 'Lưu tất cả'}
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
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor:
                activeTab === id ? 'rgba(0,240,255,0.1)' : 'transparent',
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
        {/* Basic Info & Images */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#112240',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <h2
                className="text-base font-semibold"
                style={{ color: '#ffffff' }}
              >
                {t('ownerBoats.form.basic.title')}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-xs font-medium"
                    style={{ color: '#ecf0ff' }}
                  >
                    {t('ownerBoats.form.basic.name')} *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('ownerBoats.form.basic.namePlaceholder')}
                    style={{
                      ...inputStyle,
                      borderColor: errors.name
                        ? '#EF4444'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-xs font-medium"
                    style={{ color: '#ecf0ff' }}
                  >
                    {t('ownerBoats.form.basic.type')} *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-11 w-full rounded-lg border px-4 text-sm outline-none"
                    style={inputStyle}
                  >
                    {boatTypes.map((bt) => {
                      const localizedName = t(`ownerBoats.types.${bt.code}`);
                      const displayName =
                        localizedName &&
                        !localizedName.startsWith('ownerBoats.types.')
                          ? localizedName
                          : i18n.language === 'en'
                            ? bt.name_en
                            : bt.name_vi;
                      return (
                        <option
                          key={bt.code}
                          value={bt.code}
                          style={{ color: '#000' }}
                        >
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-xs font-medium"
                    style={{ color: '#ecf0ff' }}
                  >
                    {t('ownerBoats.form.basic.capacity')} *
                  </label>
                  <Input
                    type="number"
                    value={maxPassengers}
                    onChange={(e) => setMaxPassengers(e.target.value)}
                    placeholder={t('ownerBoats.form.basic.capacityPlaceholder')}
                    style={{
                      ...inputStyle,
                      borderColor: errors.maxPassengers
                        ? '#EF4444'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  />
                  {errors.maxPassengers && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.maxPassengers}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images section integrated into Info Tab */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#112240',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-base font-semibold"
                  style={{ color: '#ffffff' }}
                >
                  Hình ảnh tàu
                </h2>
                {boatImages.length > 0 && (
                  <label className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1">
                    + Thêm ảnh
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {boatImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {boatImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-xl overflow-hidden group border border-slate-800"
                    >
                      <img
                        src={img.imageUrl}
                        alt={`boat-image-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="relative flex flex-col items-center rounded-xl border-2 border-dashed py-12 bg-slate-800/20 hover:border-cyan-500/50 transition-colors group cursor-pointer"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  <ImageIcon
                    size={40}
                    style={{ color: 'rgba(0,240,255,0.3)' }}
                    className="mb-4 group-hover:scale-110 transition-transform"
                  />
                  <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                    Kéo thả hoặc nhấn vào đây để tải ảnh tàu lên
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ JPG, PNG (Tối đa 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <ServiceTab
            boatType={type}
            services={services}
            onChange={setServices}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTab
            boatId={boatId}
            maintenances={maintenances}
            onChange={setMaintenances}
            selectedServices={selectedMaintenanceServices}
            onSelectedServicesChange={setSelectedMaintenanceServices}
          />
        )}
      </div>
    </div>
  );
}
