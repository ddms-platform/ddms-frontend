import { useRef } from 'react';
import {
  Plus,
  Trash2,
  MessageCircleQuestion,
  Upload,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/services/api';
import FaqRow from './service-tab/FaqRow';
import CruiseFields from './service-tab/CruiseFields';
import DinnerFields from './service-tab/DinnerFields';
import ComplexTourFields from './service-tab/ComplexTourFields';
import FishingFields from './service-tab/FishingFields';
import SpeedboatFields from './service-tab/SpeedboatFields';
import type { ServiceHandlers } from './service-tab/types';
import {
  downloadTemplate,
  parseServicesExcel,
  parseServicesZip,
} from './service-tab/excel-import';
import AiContentStudio from './service-tab/AiContentStudio';
import TourImagesSection from './service-tab/TourImagesSection';
import type { FaqItem } from '@/services/aiService';

export interface ComboForm {
  name: string;
  price: string;
  description: string;
  imageUrl?: string;
}
export interface RoomForm {
  name: string;
  capacity: string;
  price: string;
  description: string;
  imageUrl?: string;
}
export interface RouteForm {
  name: string;
  startPoint: string;
  endPoint: string;
  description: string;
}
export interface FaqForm {
  question: string;
  answer: string;
}

export interface ServiceFormState {
  id: string;
  serviceType: string;
  name: string;
  basePrice: string;
  /** % giá trẻ 5–11 tuổi phải trả. Rỗng = dùng mặc định hệ thống. */
  childPricePercent: string;
  /** % giá trẻ dưới 5 tuổi phải trả. */
  infantPricePercent: string;
  description: string;
  route: string;
  routes: RouteForm[];
  combos: ComboForm[];
  rooms: RoomForm[];
  faqs: FaqForm[];
  equipments: string;
  pricePerDay: string;
  tourImageUrls: string[];
}

const NEW_SERVICE_ID_PREFIX = 'new_';

/** Distinguishes drafts that only exist in the form from services already persisted server-side. */
export const isNewService = (id: string) =>
  id.startsWith(NEW_SERVICE_ID_PREFIX);

export const getEmptyService = (): ServiceFormState => ({
  id: `${NEW_SERVICE_ID_PREFIX}${Math.random().toString(36).substring(7)}`,
  serviceType: 'cruise',
  name: '',
  basePrice: '',
  childPricePercent: '50',
  infantPricePercent: '0',
  description: '',
  route: '',
  routes: [{ name: '', startPoint: '', endPoint: '', description: '' }],
  combos: [{ name: '', price: '', description: '', imageUrl: '' }],
  rooms: [{ name: '', capacity: '', price: '', description: '', imageUrl: '' }],
  faqs: [{ question: '', answer: '' }],
  equipments: '',
  pricePerDay: '',
  tourImageUrls: [],
});

interface ServiceTabProps {
  boatType: string;
  services: ServiceFormState[];
  onChange: (services: ServiceFormState[]) => void;
}

export default function ServiceTab({
  boatType,
  services,
  onChange,
}: ServiceTabProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleAddService = () => {
    onChange([...services, getEmptyService()]);
  };

  const applyImported = (imported: ServiceFormState[]) => {
    const isDefaultBlank =
      services.length === 1 &&
      !services[0].name.trim() &&
      !services[0].basePrice.trim();

    // Map existing IDs by service name to update instead of duplicating
    const existingByName = new Map<string, string>();
    services.forEach((s) => {
      if (s.name?.trim() && !isNewService(s.id)) {
        existingByName.set(s.name.trim().toLowerCase(), s.id);
      }
    });

    const mappedImported = imported.map((imp) => {
      const matchId = existingByName.get(imp.name.trim().toLowerCase());
      return matchId ? { ...imp, id: matchId } : imp;
    });

    if (isDefaultBlank) {
      onChange(mappedImported);
    } else {
      const importedNames = new Set(
        mappedImported.map((s) => s.name.trim().toLowerCase()),
      );
      const remainingOld = services.filter(
        (s) => !importedNames.has(s.name.trim().toLowerCase()),
      );
      onChange([...remainingOld, ...mappedImported]);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { services: imported, errors } = await parseServicesExcel(file);
      if (errors.length > 0) {
        toast.error(errors.slice(0, 3).join('\n'), { duration: 6000 });
      }
      if (imported.length === 0) {
        if (errors.length === 0)
          toast.error('File không có dịch vụ nào hợp lệ.');
        return;
      }
      applyImported(imported);
      toast.success(`Đã import ${imported.length} dịch vụ từ file Excel.`);
    } catch (err) {
      console.error('Failed to parse Excel:', err);
      toast.error('Không đọc được file. Hãy dùng đúng template.');
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const loadingToast = toast.loading('Đang mở ZIP và upload ảnh...');
    try {
      const { services: imported, errors } = await parseServicesZip(
        file,
        (uploaded, total) => {
          if (total > 0) {
            toast.loading(`Đang upload ảnh ${uploaded}/${total}...`, {
              id: loadingToast,
            });
          }
        },
      );
      toast.dismiss(loadingToast);
      if (errors.length > 0) {
        toast.error(errors.slice(0, 3).join('\n'), { duration: 6000 });
      }
      if (imported.length === 0) {
        if (errors.length === 0)
          toast.error('ZIP không có dịch vụ nào hợp lệ.');
        return;
      }
      applyImported(imported);
      toast.success(
        `Đã import ${imported.length} dịch vụ${
          errors.length ? ' (có cảnh báo)' : ''
        }.`,
      );
    } catch (err) {
      console.error('Failed to parse ZIP:', err);
      toast.dismiss(loadingToast);
      toast.error('Không đọc được ZIP. Kiểm tra lại file hoặc cấu trúc.');
    }
  };

  const handleRemoveService = (id: string) => {
    if (services.length === 1) return toast.error('Phải có ít nhất 1 dịch vụ!');
    onChange(services.filter((s) => s.id !== id));
  };

  const updateService = (
    id: string,
    field: keyof ServiceFormState,
    value: any,
  ) => {
    onChange(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleAddDynamicArrayItem = (
    serviceId: string,
    arrayName: 'combos' | 'rooms' | 'faqs' | 'routes',
  ) => {
    onChange(
      services.map((s) => {
        if (s.id === serviceId) {
          if (arrayName === 'combos')
            return {
              ...s,
              combos: [
                ...s.combos,
                { name: '', price: '', description: '', imageUrl: '' },
              ],
            };
          if (arrayName === 'rooms')
            return {
              ...s,
              rooms: [
                ...s.rooms,
                {
                  name: '',
                  capacity: '',
                  price: '',
                  description: '',
                  imageUrl: '',
                },
              ],
            };
          if (arrayName === 'faqs')
            return { ...s, faqs: [...s.faqs, { question: '', answer: '' }] };
          if (arrayName === 'routes')
            return {
              ...s,
              routes: [
                ...s.routes,
                { name: '', startPoint: '', endPoint: '', description: '' },
              ],
            };
        }
        return s;
      }),
    );
  };

  const handleUpdateDynamicArrayItem = (
    serviceId: string,
    arrayName: 'combos' | 'rooms' | 'faqs' | 'routes',
    index: number,
    field: string,
    value: string,
  ) => {
    onChange(
      services.map((s) => {
        if (s.id === serviceId) {
          const newArr = [...s[arrayName]] as any[];
          newArr[index] = { ...newArr[index], [field]: value };
          return { ...s, [arrayName]: newArr };
        }
        return s;
      }),
    );
  };

  const handleUploadImage = async (
    serviceId: string,
    arrayName: 'combos' | 'rooms',
    index: number,
    file: File,
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/owner/services/upload-image', formData);
      const imageUrl = res.data?.result || res.data?.imageUrl || res.data?.url;
      if (imageUrl) {
        handleUpdateDynamicArrayItem(
          serviceId,
          arrayName,
          index,
          'imageUrl',
          imageUrl,
        );
        toast.success('Tải ảnh lên thành công!');
      } else {
        toast.error('Lỗi khi tải ảnh lên.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải ảnh.');
    }
  };

  const handleUploadTourImage = async (serviceId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/owner/services/upload-image', formData);
      const imageUrl = res.data?.result || res.data?.imageUrl || res.data?.url;
      if (!imageUrl) {
        toast.error('Lỗi khi tải ảnh tour.');
        return;
      }
      onChange(
        services.map((s) =>
          s.id === serviceId
            ? { ...s, tourImageUrls: [...(s.tourImageUrls ?? []), imageUrl] }
            : s,
        ),
      );
      toast.success('Tải ảnh tour thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải ảnh tour.');
    }
  };

  const handleRemoveTourImage = (serviceId: string, index: number) => {
    onChange(
      services.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              tourImageUrls: (s.tourImageUrls ?? []).filter(
                (_, i) => i !== index,
              ),
            }
          : s,
      ),
    );
  };

  const serviceHandlers: ServiceHandlers = {
    updateService,
    addArrayItem: handleAddDynamicArrayItem,
    updateArrayItem: handleUpdateDynamicArrayItem,
    uploadImage: handleUploadImage,
  };

  const renderDynamicFields = (srv: ServiceFormState) => {
    switch (srv.serviceType) {
      case 'cruise':
        return <CruiseFields service={srv} handlers={serviceHandlers} />;
      case 'dinner':
        return <DinnerFields service={srv} handlers={serviceHandlers} />;
      case 'complex_tour':
        return <ComplexTourFields service={srv} handlers={serviceHandlers} />;
      case 'fishing':
        return <FishingFields service={srv} handlers={serviceHandlers} />;
      case 'speedboat':
        return <SpeedboatFields service={srv} handlers={serviceHandlers} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-ddms-bg-card border border-border rounded-xl p-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-foreground">
            Nhập nhanh dịch vụ từ Excel hoặc ZIP
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            <b>Excel</b> (5 sheet: Services / Rooms / Combos / Faqs / Routes) —
            link nested item bằng cột <code>service_name</code>. Ảnh: paste URL
            vào cột <code>imageUrl</code>.
            <br />
            <b>ZIP</b> (khuyến nghị) — chứa file Excel + folder ảnh. Trong Excel
            chỉ cần điền cột <code>imageFile</code> = tên file (vd:{' '}
            <code>vip.jpg</code>). Hệ thống tự upload ảnh và gắn URL.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadTemplate()}
            className="text-sm"
          >
            <FileDown className="w-4 h-4 mr-2" /> Tải Template
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => importInputRef.current?.click()}
            className="text-sm"
          >
            <Upload className="w-4 h-4 mr-2" /> Import Excel
          </Button>
          <Button
            type="button"
            variant="cyan"
            onClick={() => zipInputRef.current?.click()}
            className="text-sm"
          >
            <Upload className="w-4 h-4 mr-2" /> Import ZIP (kèm ảnh)
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportExcel}
            className="hidden"
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleImportZip}
            className="hidden"
          />
        </div>
      </div>

      {services.map((srv, index) => (
        <div
          key={srv.id}
          className="relative bg-ddms-bg-card border border-border rounded-xl p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-8 pb-5 border-b border-border">
            <h2 className="text-2xl font-black tracking-wide text-foreground flex items-center gap-3">
              <span className="bg-ddms-secondary/20 text-ddms-secondary px-3.5 py-1.5 rounded-md text-base border border-ddms-secondary/30">
                #{index + 1}
              </span>
              CẤU HÌNH DỊCH VỤ
            </h2>
            {services.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="default"
                onClick={() => handleRemoveService(srv.id)}
                className="bg-red-500/20 text-red-500 hover:bg-red-500/40 border-none text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa Dịch Vụ Này
              </Button>
            )}
          </div>

          <div className="mb-8 bg-muted/50 p-5 rounded-xl border border-border">
            <label className="text-base font-semibold text-muted-foreground block mb-4">
              Phân Loại Dịch Vụ
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => updateService(srv.id, 'serviceType', 'cruise')}
                className={`px-5 py-3 rounded-lg text-base font-medium transition-all ${srv.serviceType === 'cruise' ? 'bg-ddms-secondary text-primary-foreground' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
              >
                Tour Ngắn
              </button>
              <button
                type="button"
                onClick={() =>
                  updateService(srv.id, 'serviceType', 'complex_tour')
                }
                className={`px-5 py-3 rounded-lg text-base font-medium transition-all ${srv.serviceType === 'complex_tour' ? 'bg-purple-600 text-white' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
              >
                Tour Dài Ngày
              </button>
              <button
                type="button"
                onClick={() => updateService(srv.id, 'serviceType', 'dinner')}
                className={`px-5 py-3 rounded-lg text-base font-medium transition-all ${srv.serviceType === 'dinner' ? 'bg-amber-500 text-black' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
              >
                Ăn Tối
              </button>
              {boatType === 'fishing' && (
                <button
                  type="button"
                  onClick={() =>
                    updateService(srv.id, 'serviceType', 'fishing')
                  }
                  className={`px-5 py-3 rounded-lg text-base font-medium transition-all ${srv.serviceType === 'fishing' ? 'bg-blue-600 text-white' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
                >
                  Câu Mực Đêm
                </button>
              )}
              {boatType === 'speedboat' && (
                <button
                  type="button"
                  onClick={() =>
                    updateService(srv.id, 'serviceType', 'speedboat')
                  }
                  className={`px-5 py-3 rounded-lg text-base font-medium transition-all ${srv.serviceType === 'speedboat' ? 'bg-emerald-600 text-white' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
                >
                  Thuê Ca Nô
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <AiContentStudio
              service={srv}
              onApplyName={(name) => updateService(srv.id, 'name', name)}
              onApplyDescription={(desc) =>
                updateService(srv.id, 'description', desc)
              }
              onApplyPrice={(price) =>
                updateService(srv.id, 'basePrice', price)
              }
              onApplyFaqs={(items: FaqItem[]) => {
                const currentFaqs = srv.faqs.filter(
                  (f) => f.question.trim() || f.answer.trim(),
                );
                const merged = [
                  ...currentFaqs,
                  ...items.map((i) => ({
                    question: i.question,
                    answer: i.answer,
                  })),
                ];
                updateService(srv.id, 'faqs', merged);
              }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            <div className="space-y-5">
              <div>
                <label className="text-base font-medium text-muted-foreground">
                  Tên dịch vụ / Tour
                </label>
                <Input
                  required
                  placeholder="VD: Tour Ngắm Hoàng Hôn"
                  className="h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground"
                  value={srv.name}
                  onChange={(e) =>
                    updateService(srv.id, 'name', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-base font-medium text-muted-foreground">
                  Giá vé cơ bản / Vé lên tàu (VNĐ)
                </label>
                <Input
                  required
                  type="number"
                  placeholder="200000"
                  className="h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground"
                  value={srv.basePrice}
                  onChange={(e) =>
                    updateService(srv.id, 'basePrice', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-base font-medium text-muted-foreground">
                  Trẻ em 5–11 tuổi trả (% giá vé)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  className="h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground"
                  value={srv.childPricePercent}
                  onChange={(e) =>
                    updateService(srv.id, 'childPricePercent', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-base font-medium text-muted-foreground">
                  Em bé dưới 5 tuổi trả (% giá vé)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  className="h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground"
                  value={srv.infantPricePercent}
                  onChange={(e) =>
                    updateService(srv.id, 'infantPricePercent', e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-base font-medium text-muted-foreground">
                Mô tả tóm tắt
              </label>
              <Textarea
                required
                placeholder="Mô tả dịch vụ của bạn..."
                className="bg-ddms-bg-main border-border mt-1.5 h-32 resize-none text-sm text-foreground"
                value={srv.description}
                onChange={(e) =>
                  updateService(srv.id, 'description', e.target.value)
                }
              />
            </div>
          </div>

          <div className="mb-7">
            <TourImagesSection
              imageUrls={srv.tourImageUrls ?? []}
              onUpload={(file) => handleUploadTourImage(srv.id, file)}
              onRemove={(index) => handleRemoveTourImage(srv.id, index)}
            />
          </div>

          {renderDynamicFields(srv)}

          <div className="space-y-5 border-t border-border pt-7 mt-7">
            <h3 className="text-xl font-semibold text-emerald-600 dark:text-green-400 flex items-center gap-2.5 mb-3">
              <MessageCircleQuestion className="w-5 h-5" /> Câu hỏi thường gặp
              (FAQs)
            </h3>
            <div className="space-y-4">
              {srv.faqs.map((faq, idx) => (
                <FaqRow
                  key={idx}
                  faq={faq}
                  onChange={(field, value) =>
                    handleUpdateDynamicArrayItem(
                      srv.id,
                      'faqs',
                      idx,
                      field,
                      value,
                    )
                  }
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddDynamicArrayItem(srv.id, 'faqs')}
                className="w-full border-dashed border-border bg-transparent text-emerald-600 dark:text-green-400 hover:bg-foreground/5 py-6 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm Câu Hỏi Khác
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddService}
        className="w-full border-dashed border-ddms-secondary/50 text-ddms-secondary bg-ddms-secondary/5 hover:bg-ddms-secondary/10 py-10 text-base font-bold"
      >
        <Plus className="w-5 h-5 mr-2" /> THÊM MỘT DỊCH VỤ KHÁC CHO TÀU NÀY
      </Button>
    </div>
  );
}
