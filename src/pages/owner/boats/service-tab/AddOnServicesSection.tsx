import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadCell from './ImageUploadCell';
import type { ComboForm, ServiceFormState } from '../service-tab';

interface AddOnServicesSectionProps {
  service: ServiceFormState;
  onChangeItem: (index: number, field: keyof ComboForm, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUploadImage: (index: number, file: File) => void;
}

const labelClass = 'text-sm font-medium text-muted-foreground';
const inputClass =
  'h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground';

const AddOnServicesSection = ({
  service,
  onChangeItem,
  onAdd,
  onRemove,
  onUploadImage,
}: AddOnServicesSectionProps) => (
  <div className="space-y-5 border-t border-border pt-7 mt-7">
    <div>
      <h3 className="text-xl font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-2.5">
        <Sparkles className="w-5 h-5" /> Dịch vụ đi kèm (Tùy chọn)
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Danh sách các dịch vụ khách có thể chọn thêm khi đặt tour này (VD: thuê
        ván SUP, buffet hải sản, chụp ảnh chuyên nghiệp...).
      </p>
    </div>

    {service.combos.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Chưa có dịch vụ đi kèm nào cho tour này.
      </div>
    ) : (
      <div className="space-y-4">
        {service.combos.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-5 rounded-xl border border-border bg-muted/30 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
                Dịch vụ #{idx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(idx)}
                className="h-8 text-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Xoá
              </Button>
            </div>

            <div className="flex gap-5 items-end">
              <div className="flex-1">
                <label className={labelClass}>Tên dịch vụ</label>
                <Input
                  placeholder="VD: Thuê ván SUP"
                  className={inputClass}
                  value={item.name}
                  onChange={(e) => onChangeItem(idx, 'name', e.target.value)}
                />
              </div>
              <div className="w-44">
                <label className={labelClass}>Giá cộng thêm (VNĐ)</label>
                <Input
                  type="number"
                  placeholder="150000"
                  className={inputClass}
                  value={item.price}
                  onChange={(e) => onChangeItem(idx, 'price', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_240px] gap-5">
              <div>
                <label className={labelClass}>Mô tả ngắn</label>
                <Textarea
                  placeholder="VD: Bao gồm áo phao và mái chèo."
                  className="bg-ddms-bg-main border-border mt-1.5 h-20 resize-none text-sm text-foreground"
                  value={item.description}
                  onChange={(e) =>
                    onChangeItem(idx, 'description', e.target.value)
                  }
                />
              </div>
              <ImageUploadCell
                imageUrl={item.imageUrl}
                altLabel="Add-on"
                label="Ảnh dịch vụ (1 tấm)"
                onUpload={(file) => onUploadImage(idx, file)}
              />
            </div>
          </div>
        ))}
      </div>
    )}

    <Button
      type="button"
      variant="outline"
      onClick={onAdd}
      className="w-full border-dashed border-sky-500/40 bg-transparent text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 py-6 text-sm"
    >
      <Plus className="w-4 h-4 mr-2" /> Thêm dịch vụ đi kèm
    </Button>
  </div>
);

export default AddOnServicesSection;
