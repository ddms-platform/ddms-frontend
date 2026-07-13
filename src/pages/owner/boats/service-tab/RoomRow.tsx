import { Input } from '@/components/ui/input';
import ImageUploadCell from './ImageUploadCell';
import type { RoomForm } from '../service-tab';

interface RoomRowProps {
  room: RoomForm;
  onChange: (field: keyof RoomForm, value: string) => void;
  onUploadImage: (file: File) => void;
}

const fieldLabelClass = 'text-sm font-medium text-muted-foreground';
const inputClass =
  'h-11 bg-ddms-bg-main border-border mt-1.5 text-sm text-foreground';

const RoomRow = ({ room, onChange, onUploadImage }: RoomRowProps) => (
  <div className="flex flex-col gap-5 rounded-xl border border-border bg-muted/30 p-5">
    <div className="flex gap-5 items-end">
      <div className="flex-1">
        <label className={fieldLabelClass}>Tên hạng phòng</label>
        <Input
          placeholder="VD: Ocean View Suite"
          className={inputClass}
          value={room.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="w-28">
        <label className={fieldLabelClass}>Số khách</label>
        <Input
          type="number"
          placeholder="2"
          className={inputClass}
          value={room.capacity}
          onChange={(e) => onChange('capacity', e.target.value)}
        />
      </div>
      <div className="w-40">
        <label className={fieldLabelClass}>Giá phụ thu (VNĐ)</label>
        <Input
          type="number"
          placeholder="0"
          className={inputClass}
          value={room.price}
          onChange={(e) => onChange('price', e.target.value)}
        />
      </div>
    </div>

    <div className="grid grid-cols-[1fr_240px] gap-5">
      <div>
        <label className={fieldLabelClass}>Mô tả phòng</label>
        <Input
          placeholder="VD: Phòng riêng tư lãng mạn dành cho 2 người, trang trí hoa hồng..."
          className={inputClass}
          value={room.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <ImageUploadCell
        imageUrl={room.imageUrl}
        altLabel="Room"
        label="Ảnh phòng (1 tấm)"
        onUpload={onUploadImage}
      />
    </div>
  </div>
);

export default RoomRow;
