import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Ship,
  Layers,
  Wrench,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
  isNewService,
} from './service-tab';
import MaintenanceTab from './maintenance-tab';
import BoatBasicInfoSection from './boat-form/BoatBasicInfoSection';
import BoatImagesSection from './boat-form/BoatImagesSection';
import CertificateTab from './boat-form/CertificateTab';
import { Api } from '@/services/axios';

type Tab = 'basic' | 'services' | 'maintenance' | 'certificates';

export default function BoatForm({
  boatIdProp,
  initialTab,
  onClose,
  onSaved,
}: {
  boatIdProp?: string;
  initialTab?: Tab;
  onClose?: () => void;
  onSaved?: () => void;
} = {}) {
  const { t } = useTranslation();
  const { boatId: routeBoatId } = useParams();
  const boatId = boatIdProp || routeBoatId;
  const navigate = useNavigate();
  const isEdit = !!boatId;

  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? 'basic');
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
  const [removedServiceIds, setRemovedServiceIds] = useState<string[]>([]);
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
      } catch {
        toast.error('Không thể xóa ảnh trên máy chủ');
        return;
      }
    }
    setBoatImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServicesChange = (next: ServiceFormState[]) => {
    const nextIds = new Set(next.map((s) => s.id));
    const removed = services
      .map((s) => s.id)
      .filter((id) => !nextIds.has(id) && !isNewService(id));
    if (removed.length > 0) {
      setRemovedServiceIds((prev) => [...new Set([...prev, ...removed])]);
    }
    setServices(next);
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
      setRemovedServiceIds([]);
      if (b.images) {
        setBoatImages(b.images);
      }
      if (b.services && b.services.length > 0) {
        setServices(
          b.services.map((s) => {
            const empty = getEmptyService();
            const routes =
              s.routes && s.routes.length > 0
                ? s.routes.map((r) => ({
                    name: r.name ?? '',
                    startPoint: r.startPoint ?? '',
                    endPoint: r.endPoint ?? '',
                    description: r.description ?? '',
                  }))
                : empty.routes;
            const faqs =
              s.faqs && s.faqs.length > 0
                ? s.faqs.map((f) => ({
                    question: f.question ?? '',
                    answer: f.answer ?? '',
                  }))
                : empty.faqs;
            const rooms =
              s.rooms && s.rooms.length > 0
                ? s.rooms.map((r) => ({
                    name: r.name ?? '',
                    capacity: String(r.capacity ?? ''),
                    price: String(r.price ?? ''),
                    description: r.description ?? '',
                    imageUrl: r.imageUrl ?? '',
                  }))
                : empty.rooms;
            const combos =
              s.combos && s.combos.length > 0
                ? s.combos.map((c) => ({
                    name: c.name ?? '',
                    price: String(c.price ?? ''),
                    description: c.description ?? '',
                    imageUrl: c.imageUrl ?? '',
                  }))
                : empty.combos;
            return {
              ...empty,
              id: s.id,
              name: s.name,
              basePrice: String(s.price || 0),
              description: s.description || '',
              serviceType: s.serviceType || 'cruise',
              routes,
              faqs,
              rooms,
              combos,
            };
          }),
        );
      }
    } catch {
      toast.error('Không thể tải thông tin tàu');
    } finally {
      setLoadingBoat(false);
    }
  }, [boatId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBoat();
    }, 0);
    return () => window.clearTimeout(timer);
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
    if (!type) e.type = 'Loại tàu không được để trống';
    if (!maxPassengers || Number(maxPassengers) < 1)
      e.maxPassengers = 'Sức chứa phải lớn hơn 0';
    if (boatImages.length === 0) {
      e.images = 'Vui lòng thêm ít nhất 1 hình ảnh tàu';
      toast.error('Vui lòng thêm ít nhất 1 hình ảnh tàu');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [createdBoatId, setCreatedBoatId] = useState<string | null>(null);

  const isSavingRef = useRef(false);

  const handleSave = async () => {
    if (isSavingRef.current) return;
    if (!validate()) {
      setActiveTab('basic');
      return;
    }

    isSavingRef.current = true;
    setSaving(true);
    try {
      const effectiveBoatId = boatId || createdBoatId;
      const effectiveIsEdit = isEdit || !!createdBoatId;
      let savedBoatId = effectiveBoatId;
      const dto = { name, type, maxPassengers: Number(maxPassengers), status };

      if (effectiveIsEdit && effectiveBoatId) {
        await boatService.updateByOwner(effectiveBoatId, dto);
      } else {
        const created = await boatService.createByOwner(dto);
        savedBoatId = created.id;
        setCreatedBoatId(created.id);
      }

      if (!savedBoatId) throw new Error('Không lấy được ID tàu');

      // Sync complex services
      if (removedServiceIds.length > 0) {
        await Promise.all(
          removedServiceIds.map((serviceId) =>
            boatService.deleteServiceByOwner(savedBoatId, serviceId),
          ),
        );
        setRemovedServiceIds([]);
      }

      const newServices = services.filter((s) => isNewService(s.id) && s.name);
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
            Api.post('/owner/services/register', payload).catch((err) => {
              console.error(err);
              throw new Error('Lỗi khi đăng ký dịch vụ');
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
      isSavingRef.current = false;
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
    {
      id: 'certificates',
      label: t('ownerBoats.form.tabs.certificates'),
      icon: FileText,
    },
  ];

  if (loadingBoat) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-ddms-secondary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8 pb-24">
      {/* Header */}
      <div
        className={`flex items-center justify-between ${onClose ? 'pr-12 sm:pr-16' : ''}`}
      >
        <div className="flex items-center gap-3">
          {onClose ? (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft size={18} className="text-foreground" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to={routeName.ownerBoats}>
                <ArrowLeft size={18} className="text-foreground" />
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit
                ? t('ownerBoats.form.editTitle', { name: boat?.name ?? '' })
                : t('ownerBoats.form.createTitle')}
            </h1>
            <p className="text-xs text-muted-foreground">
              Cập nhật thông tin, hình ảnh và các dịch vụ của tàu
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="cyan"
          size="action"
          className="gap-2"
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
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl p-1 bg-muted border border-border">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === id
                ? 'bg-border text-ddms-secondary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={16} />
            {label}
            {count !== undefined && (
              <span className="ml-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] text-foreground">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <BoatBasicInfoSection
              name={name}
              type={type}
              maxPassengers={maxPassengers}
              boatTypes={boatTypes}
              errors={errors}
              onNameChange={setName}
              onTypeChange={setType}
              onMaxPassengersChange={setMaxPassengers}
            />

            <BoatImagesSection
              images={boatImages}
              error={errors.images}
              onFileChange={handleFileChange}
              onRemove={handleRemoveImage}
            />
          </div>
        )}

        {activeTab === 'services' && (
          <ServiceTab
            boatType={type}
            services={services}
            onChange={handleServicesChange}
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

        {activeTab === 'certificates' && (
          <CertificateTab boatId={boatId || createdBoatId || undefined} />
        )}
      </div>
    </div>
  );
}
