import { Plus, Trash2, MessageCircleQuestion } from 'lucide-react';
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
  description: string;
  route: string;
  routes: RouteForm[];
  combos: ComboForm[];
  rooms: RoomForm[];
  faqs: FaqForm[];
  equipments: string;
  pricePerDay: string;
}

export const getEmptyService = (): ServiceFormState => ({
  id: Math.random().toString(36).substring(7),
  serviceType: 'cruise',
  name: '',
  basePrice: '',
  description: '',
  route: '',
  routes: [{ name: '', startPoint: '', endPoint: '', description: '' }],
  combos: [{ name: '', price: '', description: '', imageUrl: '' }],
  rooms: [{ name: '', capacity: '', price: '', description: '', imageUrl: '' }],
  faqs: [{ question: '', answer: '' }],
  equipments: '',
  pricePerDay: '',
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
  const handleAddService = () => {
    onChange([...services, getEmptyService()]);
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
      const res = await api.post('/owner/services/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.isSuccess) {
        handleUpdateDynamicArrayItem(
          serviceId,
          arrayName,
          index,
          'imageUrl',
          res.data.result,
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
      {services.map((srv, index) => (
        <div
          key={srv.id}
          className="relative bg-ddms-bg-card border border-border rounded-xl p-6 mb-6"
        >
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-black tracking-wide text-foreground flex items-center gap-2">
              <span className="bg-ddms-secondary/20 text-ddms-secondary px-3 py-1 rounded-md text-sm border border-ddms-secondary/30">
                #{index + 1}
              </span>
              CẤU HÌNH DỊCH VỤ
            </h2>
            {services.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveService(srv.id)}
                className="bg-red-500/20 text-red-500 hover:bg-red-500/40 border-none"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa Dịch Vụ Này
              </Button>
            )}
          </div>

          <div className="mb-8 bg-muted/50 p-4 rounded-xl border border-border">
            <label className="text-sm font-medium text-muted-foreground block mb-3">
              Phân Loại Dịch Vụ
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateService(srv.id, 'serviceType', 'cruise')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'cruise' ? 'bg-ddms-secondary text-primary-foreground' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
              >
                Tour Ngắn
              </button>
              <button
                type="button"
                onClick={() =>
                  updateService(srv.id, 'serviceType', 'complex_tour')
                }
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'complex_tour' ? 'bg-purple-600 text-white' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
              >
                Tour Dài Ngày
              </button>
              <button
                type="button"
                onClick={() => updateService(srv.id, 'serviceType', 'dinner')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'dinner' ? 'bg-amber-500 text-black' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
              >
                Ăn Tối
              </button>
              {boatType === 'fishing' && (
                <button
                  type="button"
                  onClick={() =>
                    updateService(srv.id, 'serviceType', 'fishing')
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'fishing' ? 'bg-blue-600 text-white' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
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
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${srv.serviceType === 'speedboat' ? 'bg-emerald-600 text-white' : 'bg-ddms-bg-main text-muted-foreground border border-border hover:bg-foreground/5'}`}
                >
                  Thuê Ca Nô
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên dịch vụ / Tour
                </label>
                <Input
                  required
                  placeholder="VD: Tour Ngắm Hoàng Hôn"
                  className="bg-ddms-bg-main border-border mt-1 text-foreground"
                  value={srv.name}
                  onChange={(e) =>
                    updateService(srv.id, 'name', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Giá vé cơ bản / Vé lên tàu (VNĐ)
                </label>
                <Input
                  required
                  type="number"
                  placeholder="200000"
                  className="bg-ddms-bg-main border-border mt-1 text-foreground"
                  value={srv.basePrice}
                  onChange={(e) =>
                    updateService(srv.id, 'basePrice', e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mô tả tóm tắt
              </label>
              <Textarea
                required
                placeholder="Mô tả dịch vụ của bạn..."
                className="bg-ddms-bg-main border-border mt-1 h-27 resize-none text-foreground"
                value={srv.description}
                onChange={(e) =>
                  updateService(srv.id, 'description', e.target.value)
                }
              />
            </div>
          </div>

          {renderDynamicFields(srv)}

          <div className="space-y-4 border-t border-border pt-6 mt-6">
            <h3 className="text-lg font-semibold text-emerald-600 dark:text-green-400 flex items-center gap-2 mb-2">
              <MessageCircleQuestion className="w-5 h-5" /> Câu hỏi thường gặp
              (FAQs)
            </h3>
            <div className="space-y-3">
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
                className="w-full border-dashed border-border bg-transparent text-emerald-600 dark:text-green-400 hover:bg-foreground/5"
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
        className="w-full border-dashed border-ddms-secondary/50 text-ddms-secondary bg-ddms-secondary/5 hover:bg-ddms-secondary/10 py-8"
      >
        <Plus className="w-5 h-5 mr-2" /> THÊM MỘT DỊCH VỤ KHÁC CHO TÀU NÀY
      </Button>
    </div>
  );
}
