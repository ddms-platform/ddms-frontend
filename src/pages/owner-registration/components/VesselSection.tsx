import {
  Ship,
  Anchor,
  FileImage,
  FileText,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import FileUploadBox from './FileUploadBox';
import type { IBoatType } from '@/services/system-service';

export interface VesselFormState {
  Name: string;
  Type: string;
  Length: string;
  Beam: string;
  RegistrationNumber: string;
  MooringType: string;
  ExpectedDockingDate: string;
  ImageFiles: File[];
  DocumentFiles: File[];
}

interface VesselSectionProps {
  vessel: VesselFormState;
  index: number;
  totalCount: number;
  boatTypes: IBoatType[];
  onChange: (field: string, value: any) => void;
  onAddFiles: (
    field: 'ImageFiles' | 'DocumentFiles',
    files: FileList | null,
  ) => void;
  onRemoveFile: (
    field: 'ImageFiles' | 'DocumentFiles',
    fileIndex: number,
  ) => void;
  onAddVessel: () => void;
  onRemoveVessel: () => void;
}

const inputClass =
  'w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500';
const labelClass = 'text-[13px] font-bold text-gray-300';
const today = new Date().toISOString().split('T')[0];

const VesselSection = ({
  vessel,
  index,
  totalCount,
  boatTypes,
  onChange,
  onAddFiles,
  onRemoveFile,
  onAddVessel,
  onRemoveVessel,
}: VesselSectionProps) => (
  <div className="bg-[#0D1C33] rounded-lg p-6 shadow-xl">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[16px] font-bold text-[#00F0FF] flex items-center gap-2 uppercase tracking-wide">
        <Ship size={18} /> THÔNG TIN DU THUYỀN {index > 0 ? index + 1 : ''}
      </h2>
      <div className="flex items-center gap-2">
        {index === totalCount - 1 && (
          <button
            type="button"
            onClick={onAddVessel}
            className="w-8 h-8 rounded bg-[#00F0FF] text-[#0D1C33] flex items-center justify-center hover:bg-[#00d4e0] transition-colors shadow-lg"
          >
            <Plus size={20} />
          </button>
        )}
        {totalCount > 1 && (
          <button
            type="button"
            onClick={onRemoveVessel}
            className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      <div className="space-y-2">
        <label className={labelClass}>Tên thuyền (Vessel Name)</label>
        <input
          required
          type="text"
          value={vessel.Name}
          onChange={(e) => onChange('Name', e.target.value)}
          className={inputClass}
          placeholder="SEA MAJESTY"
        />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Loại thuyền</label>
        <select
          value={vessel.Type}
          onChange={(e) => onChange('Type', e.target.value)}
          style={{ colorScheme: 'dark' }}
          className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all appearance-none cursor-pointer"
        >
          {boatTypes.length > 0 ? (
            boatTypes.map((t) => (
              <option
                className="bg-[#060D17] text-white"
                key={t.code}
                value={t.code}
              >
                {t.nameVi}
              </option>
            ))
          ) : (
            <>
              <option className="bg-[#060D17] text-white" value="yacht">
                Du thuyền cá nhân (Yacht)
              </option>
              <option className="bg-[#060D17] text-white" value="catamaran">
                Thuyền hai thân (Catamaran)
              </option>
              <option className="bg-[#060D17] text-white" value="speedboat">
                Ca nô tốc độ (Speedboat)
              </option>
            </>
          )}
        </select>
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Chiều dài (LOA - m)</label>
        <input
          required
          type="number"
          step="0.01"
          value={vessel.Length}
          onChange={(e) => onChange('Length', e.target.value)}
          className={inputClass}
          placeholder="24.5"
        />
      </div>
      <div className="space-y-2">
        <label className={labelClass}>Chiều rộng (Beam - m)</label>
        <input
          required
          type="number"
          step="0.01"
          value={vessel.Beam}
          onChange={(e) => onChange('Beam', e.target.value)}
          className={inputClass}
          placeholder="6.2"
        />
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className={labelClass}>Số đăng ký hàng hải</label>
        <input
          required
          type="text"
          value={vessel.RegistrationNumber}
          onChange={(e) => onChange('RegistrationNumber', e.target.value)}
          className={inputClass}
          placeholder="REG-99283-VN"
        />
      </div>
    </div>

    <div className="mb-8 pt-6 border-t border-gray-700/50">
      <h3 className="text-[14px] font-bold text-[#00F0FF] mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Anchor size={16} /> NHU CẦU NEO ĐẬU
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>Loại bến mong muốn</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange('MooringType', 'Floating')}
              className={`flex-1 py-3 px-2 text-[14px] uppercase font-bold rounded transition-colors ${vessel.MooringType === 'Floating' ? 'border border-[#00F0FF] text-[#00F0FF] bg-[#060D17]/50' : 'bg-[#060D17] text-gray-400 hover:text-white'}`}
            >
              BẾN NỔI (FLOATING)
            </button>
            <button
              type="button"
              onClick={() => onChange('MooringType', 'Fixed')}
              className={`flex-1 py-3 px-2 text-[14px] uppercase font-bold rounded transition-colors ${vessel.MooringType === 'Fixed' ? 'border border-[#00F0FF] text-[#00F0FF] bg-[#060D17]/50' : 'bg-[#060D17] text-gray-400 hover:text-white'}`}
            >
              BẾN CỐ ĐỊNH
            </button>
          </div>
          <details className="mt-3 group">
            <summary className="text-[12px] text-[#00F0FF] cursor-pointer list-none flex items-center gap-1.5 opacity-80 hover:opacity-100 w-fit">
              <Info size={14} /> Tìm hiểu thêm về các loại bến
            </summary>
            <div className="mt-2 p-3.5 bg-[#060D17] rounded text-[12px] leading-relaxed text-gray-300 space-y-2.5 border border-gray-700/50">
              <p>
                <strong className="text-white">Bến nổi (Floating):</strong> Hệ
                thống phao neo đậu linh hoạt, tự động nâng hạ theo mực nước thủy
                triều. Giúp việc bước lên/xuống du thuyền luôn dễ dàng, bằng
                phẳng và an toàn.
              </p>
              <p>
                <strong className="text-white">Bến cố định (Fixed):</strong> Cầu
                cảng xây kiên cố bê tông. Khoảng cách từ mặt bến xuống thuyền sẽ
                thay đổi lên xuống theo thủy triều. Thường dành cho siêu du
                thuyền hoặc tàu neo đậu dài hạn ít di chuyển.
              </p>
            </div>
          </details>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Ngày dự kiến cập bến</label>
          <div className="relative">
            <input
              required
              type="date"
              min={today}
              value={vessel.ExpectedDockingDate}
              onChange={(e) => onChange('ExpectedDockingDate', e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>

    <div className="pt-6 border-t border-gray-700/50">
      <h3 className="text-[14px] font-bold text-[#00F0FF] mb-4 flex items-center gap-2 uppercase tracking-wide">
        <FileImage size={16} /> TÀI LIỆU & HÌNH ẢNH
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadBox
          files={vessel.ImageFiles}
          accept="image/*"
          icon={FileImage}
          variant="image"
          emptyTitle="Tải lên ảnh du thuyền"
          emptyHint="Cho phép chọn nhiều ảnh (PNG, JPG)"
          countLabel={(n) => `Đã chọn ${n} hình ảnh`}
          addMoreLabel="Thêm ảnh"
          onAdd={(files) => onAddFiles('ImageFiles', files)}
          onRemove={(i) => onRemoveFile('ImageFiles', i)}
        />
        <FileUploadBox
          files={vessel.DocumentFiles}
          accept=".pdf,image/*"
          icon={FileText}
          variant="document"
          emptyTitle="Giấy tờ đăng ký hàng hải"
          emptyHint="PDF, JPG (Cho phép nhiều file)"
          countLabel={(n) => `Đã chọn ${n} tài liệu`}
          addMoreLabel="Thêm file"
          onAdd={(files) => onAddFiles('DocumentFiles', files)}
          onRemove={(i) => onRemoveFile('DocumentFiles', i)}
        />
      </div>
    </div>
  </div>
);

export default VesselSection;
