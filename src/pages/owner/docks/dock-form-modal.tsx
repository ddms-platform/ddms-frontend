import { useState } from 'react';
import { Anchor, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dockService, type Dock, type CreateDockDto } from '@/services/dockService';

interface DockFormModalProps {
  dock?: Dock | null;
  onClose: () => void;
  onSaved: (saved: Dock) => void;
}

export default function DockFormModal({ dock, onClose, onSaved }: DockFormModalProps) {
  const isEdit = !!dock;
  const [name, setName] = useState(dock?.name ?? '');
  const [location, setLocation] = useState(dock?.location ?? '');
  const [maxBoats, setMaxBoats] = useState(String(dock?.maxBoats ?? 5));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Tên bến không được để trống';
    if (!maxBoats || Number(maxBoats) < 1) e.maxBoats = 'Sức chứa phải ≥ 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dto: CreateDockDto = {
        name,
        location: location.trim() || undefined,
        maxBoats: Number(maxBoats),
      };
      const saved = isEdit
        ? await dockService.update(dock!.id, dto)
        : await dockService.create(dto);
      toast.success(isEdit ? 'Cập nhật bến thành công' : 'Tạo bến thành công');
      onSaved(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#0d1b2e', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(0,240,255,0.12)' }}
            >
              <Anchor size={18} style={{ color: '#00F0FF' }} />
            </div>
            <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
              {isEdit ? 'Chỉnh sửa bến tàu' : 'Thêm bến tàu mới'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
            <X size={16} style={{ color: '#ecf0ff' }} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
              Tên bến tàu *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bến Bạch Đằng"
              style={{ ...inputStyle, borderColor: errors.name ? '#EF4444' : 'rgba(255,255,255,0.08)' }}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
              Địa điểm
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Quận 1, TP.HCM"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
              Sức chứa tối đa (tàu) *
            </label>
            <Input
              type="number"
              min={1}
              value={maxBoats}
              onChange={(e) => setMaxBoats(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.maxBoats ? '#EF4444' : 'rgba(255,255,255,0.08)' }}
            />
            {errors.maxBoats && <p className="mt-1 text-xs text-red-400">{errors.maxBoats}</p>}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Button variant="ghost" size="sm" onClick={onClose} style={{ color: '#ecf0ff' }}>
            Hủy
          </Button>
          <Button variant="cyan" size="sm" className="gap-2" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Cập nhật' : 'Tạo bến'}
          </Button>
        </div>
      </div>
    </div>
  );
}
