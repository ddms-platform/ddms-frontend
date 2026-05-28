import { Plus, Trash2, GripVertical, DoorOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LocalCabin {
  _localId: string;
  id?: string;
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

interface CabinTabProps {
  cabins: LocalCabin[];
  onChange: (cabins: LocalCabin[]) => void;
}

export default function CabinTab({ cabins, onChange }: CabinTabProps) {
  const { t } = useTranslation();
  const sectionStyle = { backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' };

  const addCabin = () =>
    onChange([
      ...cabins,
      { _localId: `new-c-${Date.now()}`, name: '', capacity: 2, price: 0, totalRooms: 1 },
    ]);

  const update = (idx: number, field: keyof LocalCabin, value: string | number) =>
    onChange(cabins.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  const remove = (idx: number) => onChange(cabins.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
          {t('ownerBoats.form.cabins.count', { count: String(cabins.length) })}
        </p>
        <Button variant="cyan" size="sm" className="gap-1.5" onClick={addCabin}>
          <Plus size={14} />
          {t('ownerBoats.form.cabins.add')}
        </Button>
      </div>

      {cabins.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={sectionStyle}>
          <DoorOpen size={40} className="mx-auto" style={{ color: 'rgba(0,240,255,0.3)' }} />
          <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
            {t('ownerBoats.form.cabins.empty')}
          </p>
        </div>
      ) : (
        cabins.map((cabin, idx) => (
          <div key={cabin._localId} className="rounded-2xl p-4" style={sectionStyle}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={14} style={{ color: '#ecf0ff' }} />
                <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                  {t('ownerBoats.form.cabins.label', { index: String(idx + 1) })}
                  {cabin.id && (
                    <span className="ml-2 text-[10px] font-normal text-green-400">✓ Đã lưu</span>
                  )}
                </span>
              </div>
              <button onClick={() => remove(idx)} className="rounded-lg p-1.5 hover:bg-white/5">
                <Trash2 size={14} style={{ color: '#EF4444' }} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { label: t('ownerBoats.form.cabins.name'), field: 'name', type: 'text', value: cabin.name },
                  { label: t('ownerBoats.form.cabins.capacity'), field: 'capacity', type: 'number', value: cabin.capacity },
                  { label: t('ownerBoats.form.cabins.price'), field: 'price', type: 'number', value: cabin.price },
                  { label: t('ownerBoats.form.cabins.totalRooms'), field: 'totalRooms', type: 'number', value: cabin.totalRooms },
                ] as const
              ).map(({ label, field, type, value }) => (
                <div key={field}>
                  <label className="mb-1 block text-[11px] font-medium" style={{ color: '#ecf0ff' }}>
                    {label}
                  </label>
                  <Input
                    type={type}
                    value={value}
                    onChange={(e) =>
                      update(idx, field, type === 'number' ? +e.target.value : e.target.value)
                    }
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
