import { Anchor, MapPin, Ship, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Dock } from '@/services/dockService';

interface DockCardProps {
  dock: Dock;
  onEdit: (dock: Dock) => void;
  onDelete: (id: string) => void;
  onViewSchedules: (dock: Dock) => void;
}

export default function DockCard({ dock, onEdit, onDelete, onViewSchedules }: DockCardProps) {
  const usagePct = dock.maxBoats > 0 ? Math.round((dock.currentBoats / dock.maxBoats) * 100) : 0;
  const usageColor = usagePct >= 90 ? '#EF4444' : usagePct >= 60 ? '#F59E0B' : '#10B981';

  return (
    <div
      className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
      style={{
        backgroundColor: '#112240',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: 'rgba(0,0,0,0.08) 0px 2px 8px',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(0,240,255,0.1)' }}
            >
              <Anchor size={20} style={{ color: '#00F0FF' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>
                {dock.name}
              </h3>
              {dock.location && (
                <div className="mt-0.5 flex items-center gap-1">
                  <MapPin size={11} style={{ color: '#ecf0ff' }} />
                  <span className="text-xs" style={{ color: '#ecf0ff' }}>
                    {dock.location}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(dock)}
              className="rounded-lg p-1.5 hover:bg-white/5"
              title="Chỉnh sửa"
            >
              <Pencil size={14} style={{ color: '#ecf0ff' }} />
            </button>
            <button
              onClick={() => onDelete(dock.id)}
              className="rounded-lg p-1.5 hover:bg-white/5"
              title="Xóa"
            >
              <Trash2 size={14} style={{ color: '#EF4444' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Capacity progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Ship size={13} style={{ color: '#ecf0ff' }} />
              <span className="text-xs" style={{ color: '#ecf0ff' }}>Sức chứa</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: usageColor }}>
              {dock.currentBoats}/{dock.maxBoats} tàu ({usagePct}%)
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePct}%`, backgroundColor: usageColor }}
            />
          </div>
        </div>

        {/* Schedule count */}
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={14} style={{ color: '#ecf0ff' }} />
          <span className="text-xs" style={{ color: '#ecf0ff' }}>
            {dock.schedules.length} lịch neo đậu
          </span>
        </div>

        {/* Action */}
        <Button
          variant="dark-outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => onViewSchedules(dock)}
        >
          <CalendarDays size={14} />
          Xem lịch neo đậu
        </Button>
      </div>
    </div>
  );
}
