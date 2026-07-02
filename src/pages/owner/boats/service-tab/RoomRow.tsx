import { Input } from '@/components/ui/input';
import ImageUploadCell from './ImageUploadCell';
import type { RoomForm } from '../service-tab';

interface RoomRowProps {
  room: RoomForm;
  onChange: (field: keyof RoomForm, value: string) => void;
  onUploadImage: (file: File) => void;
}

const RoomRow = ({ room, onChange, onUploadImage }: RoomRowProps) => (
  <div className="flex flex-col gap-3 bg-muted/30 p-4 rounded-lg border border-border">
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <label className="text-xs text-muted-foreground">Tên hạng phòng</label>
        <Input
          placeholder="VD: Ocean View Suite"
          className="bg-ddms-bg-main border-border mt-1 text-foreground"
          value={room.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="w-24">
        <label className="text-xs text-muted-foreground">Số khách</label>
        <Input
          type="number"
          placeholder="2"
          className="bg-ddms-bg-main border-border mt-1 text-foreground"
          value={room.capacity}
          onChange={(e) => onChange('capacity', e.target.value)}
        />
      </div>
      <div className="w-32">
        <label className="text-xs text-muted-foreground">
          Giá phụ thu (VNĐ)
        </label>
        <Input
          type="number"
          placeholder="0"
          className="bg-ddms-bg-main border-border mt-1 text-foreground"
          value={room.price}
          onChange={(e) => onChange('price', e.target.value)}
        />
      </div>
    </div>
    <div className="grid grid-cols-[1fr_200px] gap-4">
      <div>
        <label className="text-xs text-muted-foreground">Mô tả Phòng</label>
        <Input
          placeholder="VD: Phòng riêng tư lãng mạn dành cho 2 người, trang trí hoa hồng..."
          className="bg-ddms-bg-main border-border mt-1 text-foreground"
          value={room.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <ImageUploadCell
        imageUrl={room.imageUrl}
        altLabel="Room"
        label="Ảnh Phòng (1 tấm)"
        onUpload={onUploadImage}
      />
    </div>
  </div>
);

export default RoomRow;
