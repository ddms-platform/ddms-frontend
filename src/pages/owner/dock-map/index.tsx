import { useState, useEffect, useMemo } from 'react';
import { Anchor, MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { boatService, type BoatListItem } from '@/services/boatService';
import { dockService, type Dock } from '@/services/dockService';
import DockMap from './components/DockMap';
import DockSidebar from './components/DockSidebar';
import BoatDetailDrawer from './components/BoatDetailDrawer';
import { ALL_SLOTS } from './utils/slots';

export default function DockMapPage() {
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [selectedDockId, setSelectedDockId] = useState<string>('');
  const [boatsInDock, setBoatsInDock] = useState<string[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<
    (BoatListItem & { dockName?: string; slotName?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'docked' | 'others'>('docked');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [boatsRes, docksRes] = await Promise.all([
          boatService.getOwnerBoats({ pageSize: 100 }),
          dockService.getAll({ pageSize: 100 }),
        ]);

        const fetchedBoats = boatsRes.items || [];
        setBoats(fetchedBoats);

        const fetchedDocks = docksRes.data || [];
        setDocks(fetchedDocks);

        if (fetchedDocks.length > 0) {
          setSelectedDockId(fetchedDocks[0].id);
        }
      } catch (error) {
        console.error('Failed to load map data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedDock = useMemo(() => {
    return docks.find((d) => d.id === selectedDockId) || null;
  }, [docks, selectedDockId]);

  const boatLocations = useMemo(() => {
    const locations: Record<string, { dockName: string; slotName: string }> =
      {};
    const now = new Date();

    docks.forEach((dock) => {
      const activeSchedules = (dock.schedules || []).filter((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return start <= now && end >= now;
      });

      activeSchedules.forEach((schedule, idx) => {
        const slot = ALL_SLOTS[idx % ALL_SLOTS.length];
        if (slot) {
          locations[schedule.boatId] = {
            dockName: dock.name,
            slotName: slot.id,
          };
        }
      });
    });

    return locations;
  }, [docks]);

  const activeScheduledBoats = useMemo(() => {
    if (!selectedDock) return [];
    const now = new Date();

    const activeSchedules = (selectedDock.schedules || []).filter((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      const isCurrent = start <= now && end >= now;
      const isOwnerBoat = boats.some((b) => b.id === s.boatId);
      return isCurrent && isOwnerBoat;
    });

    return activeSchedules
      .map((schedule, idx) => {
        const boatDetail = boats.find((b) => b.id === schedule.boatId);
        const slot = ALL_SLOTS[idx % ALL_SLOTS.length];
        if (!slot) return null;

        const isRunning = boatDetail ? boatDetail.status === 'running' : false;

        return {
          ...boatDetail,
          id: schedule.boatId,
          name: schedule.boatName || boatDetail?.name || 'Tàu không tên',
          slotName: slot.id,
          x: slot.x,
          y: slot.y,
          rotate: slot.rotate,
          pier: slot.pier,
          hullColor: isRunning ? '#ffffff' : '#fef3c7',
          textColor: isRunning ? 'text-emerald-400' : 'text-amber-400',
          scheduleId: schedule.id,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          dockName: selectedDock.name,
        };
      })
      .filter(Boolean) as Array<any>;
  }, [selectedDock, boats]);

  const otherBoats = useMemo(() => {
    return boats.filter(
      (b) => !activeScheduledBoats.some((asb) => asb.id === b.id),
    );
  }, [boats, activeScheduledBoats]);

  const activeSlots = useMemo(() => {
    if (!selectedDock) return [];
    return ALL_SLOTS.slice(0, selectedDock.maxBoats);
  }, [selectedDock]);

  useEffect(() => {
    setBoatsInDock([]);
    activeScheduledBoats.forEach((boat, idx) => {
      setTimeout(
        () => {
          setBoatsInDock((prev) => {
            if (prev.includes(boat.id)) return prev;
            return [...prev, boat.id];
          });
        },
        150 + idx * 100,
      );
    });
  }, [selectedDockId, activeScheduledBoats.length]);

  const selectedBoatLocation = useMemo(() => {
    if (!selectedBoat) return null;
    return boatLocations[selectedBoat.id] || null;
  }, [selectedBoat, boatLocations]);

  const formatScheduleTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      );
    } catch {
      return '';
    }
  };

  const occupancy = activeScheduledBoats.length;
  const capacity = selectedDock?.maxBoats || 0;
  const percent =
    capacity > 0 ? Math.min(100, Math.round((occupancy / capacity) * 100)) : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <p className="text-cyan-400 font-medium animate-pulse">
            Đang tải dữ liệu bến bãi...
          </p>
        </div>
      </div>
    );
  }

  if (docks.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f172a] p-4 lg:p-8 font-sans text-slate-100 flex flex-col justify-center items-center">
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md max-w-md w-full p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center">
            <Anchor className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Chưa có bến tàu nào
            </h2>
            <p className="text-slate-400 text-sm">
              Hệ thống chưa ghi nhận bến tàu nào. Vui lòng chuyển sang trang{' '}
              <strong>Quản lý Bến Tàu</strong> để thêm bến và lập lịch neo đậu
              cho tàu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0f172a] p-4 lg:p-8 font-sans text-slate-100 flex flex-col">
      <div className="mb-6 z-10 relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <Navigation className="w-8 h-8 text-cyan-400 rotate-45" />
            {selectedDock ? selectedDock.name : 'Bản Đồ Bến Tàu'}
          </h1>
          <p className="text-sm text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
            {selectedDock?.location || 'Không có thông tin vị trí'} • Sức chứa:{' '}
            {selectedDock?.maxBoats} khoang neo đậu
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>{' '}
            {boats.filter((b) => b.status === 'running').length} Đang chạy
          </Badge>
          <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>{' '}
            {boats.filter((b) => b.status !== 'running').length} Đang chờ
          </Badge>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-stretch flex-1 w-full max-w-400 mx-auto">
        <DockMap
          selectedDock={selectedDock}
          activeSlots={activeSlots}
          activeScheduledBoats={activeScheduledBoats}
          boatsInDock={boatsInDock}
          onSelectBoat={setSelectedBoat}
        />

        <DockSidebar
          docks={docks}
          selectedDockId={selectedDockId}
          onSelectDock={setSelectedDockId}
          capacity={capacity}
          occupancy={occupancy}
          percent={percent}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeScheduledBoats={activeScheduledBoats}
          otherBoats={otherBoats}
          boatLocations={boatLocations}
          onSelectBoat={setSelectedBoat}
          formatScheduleTime={formatScheduleTime}
        />
      </div>

      <BoatDetailDrawer
        boat={selectedBoat}
        location={selectedBoatLocation}
        onClose={() => setSelectedBoat(null)}
      />
    </div>
  );
}
