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
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  boatService,
  type Boat,
  type BoatMaintenance,
} from '@/services/boatService';
import {
  ownerDocumentService,
  type OwnerDocumentsOverviewResponse,
} from '@/services/ownerDocumentService';
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
  const [docOverview, setDocOverview] =
    useState<OwnerDocumentsOverviewResponse | null>(null);
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
            const tourImageUrls =
              s.imageUrls && s.imageUrls.length > 0
                ? s.imageUrls.filter(Boolean)
                : s.imageUrl
                  ? [s.imageUrl]
                  : [];
            return {
              ...empty,
              id: s.id,
              name: s.name,
              basePrice: String(s.price || 0),
              childPricePercent: String(s.childPricePercent ?? 50),
              infantPricePercent: String(s.infantPricePercent ?? 0),
              description: s.description || '',
              serviceType: s.serviceType || 'cruise',
              routes,
              faqs,
              rooms,
              combos,
              tourImageUrls,
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

  useEffect(() => {
    ownerDocumentService
      .getOverview()
      .then(setDocOverview)
      .catch(() => null);
  }, []);

  const isOverdueAndIncomplete = Boolean(docOverview?.isLocked);

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
    if (isOverdueAndIncomplete) {
      if (docOverview?.isPendingReview) {
        toast.warning(
          'Hồ sơ pháp lý của bạn đang chờ Ban quản trị xét duyệt. Không thể lưu thay đổi lúc này!',
        );
      } else {
        toast.error(
          isEdit
            ? 'Tài khoản của bạn đã quá hạn nộp giấy tờ pháp lý. Không thể chỉnh sửa thông tin tàu!'
            : 'Tài khoản của bạn đã quá hạn nộp giấy tờ pháp lý. Không thể đăng ký thêm tàu mới!',
        );
      }
      return;
    }
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

      const activeServices = services.filter((s) => s.name && s.name.trim());
      if (activeServices.length > 0) {
        const payloads = activeServices.map((srv) => ({
          id: isNewService(srv.id) ? undefined : srv.id,
          boatId: savedBoatId,
          serviceType: srv.serviceType,
          name: srv.name,
          basePrice: parseFloat(srv.basePrice || '0'),
          // Để trống thì gửi undefined để server giữ nguyên giá trị cũ, không ghi đè thành 0.
          childPricePercent:
            srv.childPricePercent.trim() === ''
              ? undefined
              : parseFloat(srv.childPricePercent),
          infantPricePercent:
            srv.infantPricePercent.trim() === ''
              ? undefined
              : parseFloat(srv.infantPricePercent),
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
          imageUrls: (srv.tourImageUrls ?? []).filter(Boolean),
        }));

        await Promise.all(
          payloads.map((payload) =>
            Api.post('/owner/services/register', payload).catch((err) => {
              console.error(err);
              throw new Error('Lỗi khi đăng ký/cập nhật dịch vụ');
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
      {/* Overdue / Compliance Banner */}
      {isOverdueAndIncomplete && (
        <div
          className={`mb-6 rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
            docOverview?.isPendingReview
              ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                docOverview?.isPendingReview
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                {docOverview?.isPendingReview
                  ? 'Hồ sơ pháp lý đang chờ Ban quản trị phê duyệt'
                  : isEdit
                    ? 'Chức năng chỉnh sửa tàu đang ở chế độ Chỉ đọc (Read-only)'
                    : 'Chức năng đăng ký tàu mới đang bị tạm khóa'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {docOverview?.isPendingReview
                  ? 'Bạn đã nộp đầy đủ giấy tờ. Hệ thống sẽ tự động mở khóa chỉnh sửa tàu ngay sau khi được Admin phê duyệt.'
                  : 'Hồ sơ pháp lý của bạn chưa hoàn tất và đã quá thời hạn nộp. Vui lòng tải lên giấy tờ để gửi Admin xét duyệt và mở khóa.'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={docOverview?.isPendingReview ? 'default' : 'destructive'}
            className="cursor-pointer shrink-0 rounded-xl font-bold"
            asChild
          >
            <Link to="/owner/documents">Xem hồ sơ giấy tờ &rarr;</Link>
          </Button>
        </div>
      )}

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
        {isOverdueAndIncomplete ? (
          <Button
            type="button"
            variant="destructive"
            size="action"
            className="gap-2 opacity-80 cursor-not-allowed"
            disabled
          >
            <Lock size={16} />
            {isEdit ? 'Tạm khóa lưu' : 'Tạm khóa thêm tàu'}
          </Button>
        ) : (
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
        )}
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
