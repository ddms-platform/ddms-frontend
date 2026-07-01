import { Input } from '@/components/ui/input';
import ImageUploadCell from './ImageUploadCell';
import type { ComboForm } from '../service-tab';

interface ComboRowProps {
  combo: ComboForm;
  onChange: (field: keyof ComboForm, value: string) => void;
  onUploadImage: (file: File) => void;
}

const ComboRow = ({ combo, onChange, onUploadImage }: ComboRowProps) => (
  <div className="flex flex-col gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <label className="text-xs text-slate-400">Tên Combo</label>
        <Input
          placeholder="VD: Combo Hải sản nướng"
          className="bg-[#0B132B] border-slate-700 mt-1"
          value={combo.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="w-40">
        <label className="text-xs text-slate-400">Giá (VNĐ)</label>
        <Input
          type="number"
          placeholder="450000"
          className="bg-[#0B132B] border-slate-700 mt-1"
          value={combo.price}
          onChange={(e) => onChange('price', e.target.value)}
        />
      </div>
    </div>
    <div className="grid grid-cols-[1fr_200px] gap-4">
      <div>
        <label className="text-xs text-slate-400">Mô tả Combo</label>
        <Input
          placeholder="VD: Set menu hải sản 5 món đặc sản Đà Nẵng..."
          className="bg-[#0B132B] border-slate-700 mt-1"
          value={combo.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <ImageUploadCell
        imageUrl={combo.imageUrl}
        altLabel="Combo"
        label="Ảnh Combo (1 tấm)"
        onUpload={onUploadImage}
      />
    </div>
  </div>
);

export default ComboRow;
