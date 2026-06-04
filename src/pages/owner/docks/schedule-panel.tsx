import { useState, useCallback } from 'react';
import { Ship, X, Trash2, RefreshCw, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { dockService, type Dock, type DockSchedule } from '@/services/dockService';

interface SchedulePanelProps {
  dock: Dock;
  onClose: () => void;
}

export default function SchedulePanel({ dock, onClose }: SchedulePanelProps) {
  const [schedules, setSchedules] = useState<DockSchedule[]>(dock.schedules);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dockService.getSchedules(dock.id);
      setSchedules(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải lịch');
    } finally {
      setLoading(false);
    }
  }, [dock.id]);

  const handleDelete = async (scheduleId: string) => {
    try {
      await dockService.deleteSchedule(dock.id, scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      toast.success('Đã xóa lịch neo đậu');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  const now = new Date();

  const getStatus = (s: DockSchedule) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    if (start <= now && end >= now) return 'active';
    if (end < now) return 'past';
    return 'upcoming';
  };

  const STATUS_STYLE = {
    active: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'Đang neo', labelColor: '#10B981', labelBg: 'rgba(16,185,129,0.15)' },
    past: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.04)', label: 'Đã xong', labelColor: '#9ca3af', labelBg: 'rgba(255,255,255,0.06)' },
    upcoming: { bg: 'rgba(0,240,255,0.04)', border: 'rgba(0,240,255,0.1)', label: 'Sắp đến', labelColor: '#00F0FF', labelBg: 'rgba(0,240,255,0.1)' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#0d1b2e', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
              Lịch neo đậu — {dock.name}
            </h2>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {schedules.length} lịch đã đặt
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchSchedules} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ color: '#ecf0ff' }} />
            </Button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
              <X size={16} style={{ color: '#ecf0ff' }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {schedules.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CalendarDays size={36} style={{ color: 'rgba(0,240,255,0.3)' }} />
              <p className="mt-3 text-sm" style={{ color: '#ecf0ff' }}>
                Chưa có lịch neo đậu nào
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => {
                const st = getStatus(s);
                const style = STATUS_STYLE[st];
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl p-4"
                    style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: style.labelBg }}
                      >
                        <Ship size={16} style={{ color: style.labelColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                          {s.boatName ?? 'Tàu không xác định'}
                        </p>
                        <p className="text-xs" style={{ color: '#ecf0ff' }}>
                          {new Date(s.startTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                          {' → '}
                          {new Date(s.endTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: style.labelBg, color: style.labelColor }}
                      >
                        {style.label}
                      </span>
                      {st !== 'past' && (
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-lg p-1.5 hover:bg-white/5"
                        >
                          <Trash2 size={13} style={{ color: '#EF4444' }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
