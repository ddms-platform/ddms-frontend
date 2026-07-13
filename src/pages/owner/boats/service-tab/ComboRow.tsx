import { Input } from '@/components/ui/input';
import ImageUploadCell from './ImageUploadCell';
import type { ComboForm } from '../service-tab';

interface ComboRowProps {
  combo: ComboForm;
  onChange: (field: keyof ComboForm, value: string) => void;
  onUploadImage: (file: File) => void;
}

const fieldLabelClass = 'text-sm font-medium text-muted-foreground';
const inputClass =
  'h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground';

const ComboRow = ({ combo, onChange, onUploadImage }: ComboRowProps) => (
  <div className="flex flex-col gap-5 rounded-xl border border-border bg-muted/30 p-5">
    <div className="flex gap-5 items-end">
      <div className="flex-1">
        <label className={fieldLabelClass}>Tên combo</label>
        <Input
          placeholder="VD: Combo Hải sản nướng"
          className={inputClass}
          value={combo.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="w-44">
        <label className={fieldLabelClass}>Giá (VNĐ)</label>
        <Input
          type="number"
          placeholder="450000"
          className={inputClass}
          value={combo.price}
          onChange={(e) => onChange('price', e.target.value)}
        />
      </div>
    </div>

    <div className="grid grid-cols-[1fr_240px] gap-5">
      <div>
        <label className={fieldLabelClass}>Mô tả combo</label>
        <Input
          placeholder="VD: Set menu hải sản 5 món đặc sản Đà Nẵng..."
          className={inputClass}
          value={combo.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <ImageUploadCell
        imageUrl={combo.imageUrl}
        altLabel="Combo"
        label="Ảnh combo (1 tấm)"
        onUpload={onUploadImage}
      />
    </div>
  </div>
);

export default ComboRow;
