import { useState, useEffect, useCallback, useMemo } from 'react';
import { Anchor, Plus, Search, Ship, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dockService, type Dock } from '@/services/dockService';
import DockCard from './dock-card';
import DockFormModal from './dock-form-modal';
import SchedulePanel from './schedule-panel';

export default function DockManagementPage() {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingDock, setEditingDock] = useState<Dock | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingDock, setViewingDock] = useState<Dock | null>(null);

  const fetchDocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dockService.getAll({ pageSize: 100 });
      setDocks(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách bến tàu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocks(); }, [fetchDocks]);

  const filteredDocks = useMemo(
    () =>
      docks.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          (d.location ?? '').toLowerCase().includes(search.toLowerCase())
      ),
    [docks, search]
  );

  const stats = useMemo(() => ({
    total: docks.length,
    totalCapacity: docks.reduce((s, d) => s + d.maxBoats, 0),
    currentlyUsed: docks.reduce((s, d) => s + d.currentBoats, 0),
  }), [docks]);

  const handleSaved = (saved: Dock) => {
    setDocks((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      return idx >= 0 ? prev.map((d, i) => (i === idx ? saved : d)) : [saved, ...prev];
    });
    setShowForm(false);
    setEditingDock(null);
  };

  const handleEdit = (dock: Dock) => {
    setEditingDock(dock);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bến tàu này?')) return;
    try {
      await dockService.delete(id);
      setDocks((prev) => prev.filter((d) => d.id !== id));
      toast.success('Đã xóa bến tàu');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại');
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
          <Button variant="ghost" size="icon" onClick={fetchDocks}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ color: '#ecf0ff' }} />
          </Button>
          <Button variant="cyan" size="action" className="gap-2" onClick={() => { setEditingDock(null); setShowForm(true); }}>
            <Plus size={16} />
            Thêm bến tàu
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng bến', value: stats.total, icon: Anchor, iconColor: '#00F0FF', bg: 'rgba(0,240,255,0.12)' },
          { label: 'Sức chứa', value: stats.totalCapacity, icon: Ship, iconColor: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
          { label: 'Đang neo', value: stats.currentlyUsed, icon: Clock, iconColor: '#10B981', bg: 'rgba(16,185,129,0.12)' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${s.bg}, transparent)`, border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-2">
              <s.icon size={16} style={{ color: s.iconColor }} />
              <span className="text-xs font-medium" style={{ color: '#ecf0ff' }}>{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: '#ffffff' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" style={{ color: '#ecf0ff' }} />
          <Input
            id="dock-search"
            placeholder="Tìm bến theo tên, địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-16 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: '#00F0FF' }} />
        </div>
      ) : filteredDocks.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(0,240,255,0.08)' }}>
            <Anchor size={36} style={{ color: '#00F0FF' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            {search ? 'Không tìm thấy bến nào' : 'Chưa có bến tàu nào'}
          </h3>
          {!search && (
            <Button variant="cyan" size="action" className="gap-2" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Thêm bến đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocks.map((dock) => (
            <DockCard
              key={dock.id}
              dock={dock}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewSchedules={setViewingDock}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <DockFormModal
          dock={editingDock}
          onClose={() => { setShowForm(false); setEditingDock(null); }}
          onSaved={handleSaved}
        />
      )}
      {viewingDock && (
        <SchedulePanel dock={viewingDock} onClose={() => setViewingDock(null)} />
      )}
    </div>
  );
}
