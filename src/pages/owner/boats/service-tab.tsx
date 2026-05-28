import { Plus, Trash2, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface LocalService {
  _localId: string;
  id?: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

interface ServiceTabProps {
  services: LocalService[];
  onChange: (services: LocalService[]) => void;
}

export default function ServiceTab({ services, onChange }: ServiceTabProps) {
  const { t } = useTranslation();
  const sectionStyle = { backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' };

  const addService = () =>
    onChange([
      ...services,
      { _localId: `new-s-${Date.now()}`, name: '', price: 0, isActive: true },
    ]);

  const update = <K extends keyof LocalService>(idx: number, field: K, value: LocalService[K]) =>
    onChange(services.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));

  const remove = (idx: number) => onChange(services.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: '#ecf0ff' }}>
          {t('ownerBoats.form.services.count', { count: String(services.length) })}
        </p>
        <Button variant="cyan" size="sm" className="gap-1.5" onClick={addService}>
          <Plus size={14} />
          {t('ownerBoats.form.services.add')}
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={sectionStyle}>
          <Layers size={40} className="mx-auto" style={{ color: 'rgba(0,240,255,0.3)' }} />
          <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
            {t('ownerBoats.form.services.empty')}
          </p>
        </div>
      ) : (
        services.map((svc, idx) => (
          <div
            key={svc._localId}
            className="flex items-center gap-3 rounded-2xl p-4"
            style={sectionStyle}
          >
            <div className="grid flex-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.services.name')}
                  {svc.id && <span className="ml-1 text-[10px] text-green-400">✓</span>}
                </label>
                <Input
                  value={svc.name}
                  onChange={(e) => update(idx, 'name', e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium" style={{ color: '#ecf0ff' }}>
                  {t('ownerBoats.form.services.price')}
                </label>
                <Input
                  type="number"
                  value={svc.price}
                  onChange={(e) => update(idx, 'price', +e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-xs" style={{ color: '#ecf0ff' }}>
                  <Switch
                    checked={svc.isActive}
                    onCheckedChange={(checked) => update(idx, 'isActive', checked)}
                  />
                  {t('ownerBoats.form.services.active')}
                </label>
              </div>
            </div>
            <button
              onClick={() => remove(idx)}
              className="shrink-0 rounded-lg p-1.5 hover:bg-white/5"
            >
              <Trash2 size={14} style={{ color: '#EF4444' }} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
