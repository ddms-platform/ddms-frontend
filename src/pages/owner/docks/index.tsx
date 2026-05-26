import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Anchor,
  Plus,
  Search,
  MapPin,
  Ship,
  Clock,
  Trash2,
  Pencil,
  X,
  Save,
  RefreshCw,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  dockService,
  type Dock,
  type DockSchedule,
  type CreateDockDto,
} from '@/services/dockService';

// ── Dock Form Modal ───────────────────────────────────────────────────────────

function DockFormModal({
  dock,
  onClose,
  onSaved,
}: {
  dock?: Dock | null;
  onClose: () => void;
  onSaved: (saved: Dock) => void;
}) {
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
        location: location || undefined,
        maxBoats: Number(maxBoats),
      };
      const saved = isEdit
        ? await dockService.update(dock!.id, dto)
        : await dockService.create(dto);
      onSaved(saved);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#0d1b2e', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: '#ecf0ff' }}>
              Tên bến tàu *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bến Bạch Đằng"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderColor: errors.name ? '#EF4444' : 'rgba(255,255,255,0.08)',
                color: '#fff',
              }}
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
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
              }}
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
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderColor: errors.maxBoats ? '#EF4444' : 'rgba(255,255,255,0.08)',
                color: '#fff',
              }}
            />
            {errors.maxBoats && <p className="mt-1 text-xs text-red-400">{errors.maxBoats}</p>}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Button variant="ghost" size="sm" onClick={onClose} style={{ color: '#ecf0ff' }}>
            Hủy
          </Button>
          <Button
            variant="cyan"
            size="sm"
            className="gap-2"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Cập nhật' : 'Tạo bến'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Dock Schedule Panel ───────────────────────────────────────────────────────

function SchedulePanel({ dock, onClose }: { dock: Dock; onClose: () => void }) {
  const [schedules, setSchedules] = useState<DockSchedule[]>(dock.schedules);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dockService.getSchedules(dock.id);
      setSchedules(data);
    } finally {
      setLoading(false);
    }
  }, [dock.id]);

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await dockService.deleteSchedule(dock.id, scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  const now = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: '#0d1b2e',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '80vh',
        }}
      >
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
              <RefreshCw
                size={14}
                className={loading ? 'animate-spin' : ''}
                style={{ color: '#ecf0ff' }}
              />
            </Button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5">
              <X size={16} style={{ color: '#ecf0ff' }} />
            </button>
          </div>
        </div>

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
                const start = new Date(s.startTime);
                const end = new Date(s.endTime);
                const isActive = start <= now && end >= now;
                const isPast = end < now;

                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl p-4"
                    style={{
                      backgroundColor: isActive
                        ? 'rgba(16,185,129,0.08)'
                        : isPast
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,240,255,0.04)',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : isPast ? 'rgba(255,255,255,0.04)' : 'rgba(0,240,255,0.1)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(0,240,255,0.08)',
                        }}
                      >
                        <Ship size={16} style={{ color: isActive ? '#10B981' : '#00F0FF' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                          {s.boatName ?? 'Tàu không xác định'}
                        </p>
                        <p className="text-xs" style={{ color: '#ecf0ff' }}>
                          {start.toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                          {' → '}
                          {end.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(16,185,129,0.15)'
                            : isPast
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(0,240,255,0.1)',
                          color: isActive ? '#10B981' : isPast ? '#9ca3af' : '#00F0FF',
                        }}
                      >
                        {isActive ? 'Đang neo' : isPast ? 'Đã xong' : 'Sắp đến'}
                      </span>
                      {!isPast && (
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="rounded-lg p-1.5 hover:bg-white/5"
                          title="Xóa lịch"
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DockManagementPage() {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDock, setEditingDock] = useState<Dock | null>(null);
  const [viewingSchedulesDock, setViewingSchedulesDock] = useState<Dock | null>(null);

  const fetchDocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dockService.getAll({ pageSize: 100 });
      setDocks(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách bến tàu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocks();
  }, [fetchDocks]);

  const filteredDocks = useMemo(
    () =>
      docks.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          (d.location ?? '').toLowerCase().includes(search.toLowerCase())
      ),
    [docks, search]
  );

  const stats = useMemo(
    () => ({
      total: docks.length,
      totalCapacity: docks.reduce((s, d) => s + d.maxBoats, 0),
      currentlyUsed: docks.reduce((s, d) => s + d.currentBoats, 0),
    }),
    [docks]
  );

  const handleSaved = (saved: Dock) => {
    setDocks((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      return idx >= 0 ? prev.map((d, i) => (i === idx ? saved : d)) : [saved, ...prev];
    });
    setShowForm(false);
    setEditingDock(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bến tàu này?')) return;
    try {
      await dockService.delete(id);
      setDocks((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff', letterSpacing: '-0.44px' }}>
            Quản lý Bến Tàu
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
            Quản lý bến neo đậu và lịch phân công tàu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchDocks} title="Làm mới">
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
              style={{ color: '#ecf0ff' }}
            />
          </Button>
          <Button
            variant="cyan"
            size="action"
            className="gap-2"
            onClick={() => {
              setEditingDock(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} />
            Thêm bến tàu
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          {
            label: 'Tổng bến',
            value: stats.total,
            icon: Anchor,
            gradient: 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,240,255,0.04))',
            iconColor: '#00F0FF',
          },
          {
            label: 'Tổng sức chứa',
            value: stats.totalCapacity,
            icon: Ship,
            gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))',
            iconColor: '#8B5CF6',
          },
          {
            label: 'Đang neo đậu',
            value: stats.currentlyUsed,
            icon: Clock,
            gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
            iconColor: '#10B981',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: s.gradient, border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-2">
              <s.icon size={16} style={{ color: s.iconColor }} />
              <span className="text-xs font-medium" style={{ color: '#ecf0ff' }}>
                {s.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: '#ffffff' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            style={{ color: '#ecf0ff' }}
          />
          <Input
            id="dock-search"
            placeholder="Tìm bến theo tên, địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
            }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-16 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: '#00F0FF' }} />
        </div>
      ) : error ? (
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="cyan" size="sm" className="gap-2" onClick={fetchDocks}>
            <RefreshCw size={14} /> Thử lại
          </Button>
        </div>
      ) : filteredDocks.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,240,255,0.08)' }}
          >
            <Anchor size={36} style={{ color: '#00F0FF' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            {search ? 'Không tìm thấy bến nào' : 'Chưa có bến tàu nào'}
          </h3>
          {!search && (
            <Button
              variant="cyan"
              size="action"
              className="gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Thêm bến đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocks.map((dock) => {
            const usagePct =
              dock.maxBoats > 0 ? Math.round((dock.currentBoats / dock.maxBoats) * 100) : 0;
            const usageColor = usagePct >= 90 ? '#EF4444' : usagePct >= 60 ? '#F59E0B' : '#10B981';

            return (
              <div
                key={dock.id}
                className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                style={{
                  backgroundColor: '#112240',
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'rgba(0,0,0,0.08) 0px 2px 8px',
                }}
              >
                {/* Card Header */}
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
                        onClick={() => {
                          setEditingDock(dock);
                          setShowForm(true);
                        }}
                        className="rounded-lg p-1.5 hover:bg-white/5"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={14} style={{ color: '#ecf0ff' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(dock.id)}
                        className="rounded-lg p-1.5 hover:bg-white/5"
                        title="Xóa"
                      >
                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Capacity bar */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#ecf0ff' }}>
                        Sức chứa
                      </span>
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

                  {/* Actions */}
                  <Button
                    variant="dark-outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setViewingSchedulesDock(dock)}
                  >
                    <CalendarDays size={14} />
                    Xem lịch neo đậu
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingDock) && (
        <DockFormModal
          dock={editingDock}
          onClose={() => {
            setShowForm(false);
            setEditingDock(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Schedule Panel */}
      {viewingSchedulesDock && (
        <SchedulePanel dock={viewingSchedulesDock} onClose={() => setViewingSchedulesDock(null)} />
      )}
    </div>
  );
}
