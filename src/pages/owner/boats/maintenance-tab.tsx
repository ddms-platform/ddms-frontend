import { Plus, Trash2, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { boatService, type BoatMaintenance } from '@/services/boatService';

interface MaintenanceTabProps {
  boatId?: string;
  maintenances: BoatMaintenance[];
  onChange: (maintenances: BoatMaintenance[]) => void;
}

export default function MaintenanceTab({ boatId, maintenances, onChange }: MaintenanceTabProps) {
  const { t } = useTranslation();
  const sectionStyle = { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(245,158,11,0.12)' };

  const handleDelete = async (m: BoatMaintenance) => {
    if (!boatId) return;
    try {
      await boatService.deleteMaintenance(boatId, m.id);
      onChange(maintenances.filter((x) => x.id !== m.id));
      toast.success('Đã xóa lịch bảo trì');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
          {t('ownerBoats.form.maintenance.title')}
        </h2>
        <Button variant="cyan" size="sm" className="gap-1.5" disabled={!boatId}>
          <Plus size={14} />
          {t('ownerBoats.form.maintenance.add')}
        </Button>
      </div>

      {maintenances.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl py-12 text-center" style={{ backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Wrench size={36} style={{ color: 'rgba(245,158,11,0.3)' }} />
          <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
            {t('ownerBoats.form.maintenance.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenances.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl p-3"
              style={sectionStyle}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                  {m.reason || t('ownerBoats.form.maintenance.default')}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {new Date(m.startTime).toLocaleDateString('vi-VN')} →{' '}
                  {new Date(m.endTime).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(m)}
                className="rounded-lg p-1.5 hover:bg-white/5"
              >
                <Trash2 size={14} style={{ color: '#EF4444' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
