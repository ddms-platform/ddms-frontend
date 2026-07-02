import { useState, useEffect, useMemo } from 'react';
import { Anchor, MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { boatService, type BoatListItem } from '@/services/boatService';
import { dockService, type Dock } from '@/services/dockService';
import DockMap from './components/DockMap';
import DockSidebar from './components/DockSidebar';
import BoatDetailDrawer from './components/BoatDetailDrawer';
import { ALL_SLOTS } from './utils/slots';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="min-h-[calc(100vh-4rem)] bg-ddms-bg-owner p-4 lg:p-8 space-y-6 animate-pulse text-foreground">
        {/* Header Tabs Skeleton */}
        <div className="flex gap-2 border-b border-border pb-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Split Map Layout Skeleton */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map canvas skeleton */}
          <div className="flex-1 min-h-125 lg:h-150 bg-ddms-bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="flex-1 flex items-center justify-center py-10">
              <div className="w-80 h-80 rounded-full border border-dashed border-border flex items-center justify-center relative">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="absolute top-10 left-10 w-12 h-6 rounded-md" />
                <Skeleton className="absolute bottom-10 right-10 w-12 h-6 rounded-md" />
                <Skeleton className="absolute top-10 right-10 w-12 h-6 rounded-md" />
                <Skeleton className="absolute bottom-10 left-10 w-12 h-6 rounded-md" />
              </div>
            </div>
            <div className="flex justify-center gap-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Sidebar details skeleton */}
          <div className="w-full lg:w-96 lg:h-150 bg-ddms-bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Progress bar skeleton */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Tabs selector skeleton */}
              <div className="flex gap-2 bg-muted/40 p-1 rounded-xl">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
              </div>

              {/* List items skeleton */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 border-b border-border pb-3"
                  >
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="w-12 h-5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (docks.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-ddms-bg-owner p-4 lg:p-8 font-sans text-foreground flex flex-col justify-center items-center">
        <div className="bg-ddms-bg-card border border-border max-w-md w-full p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-ddms-secondary/10 rounded-full flex items-center justify-center">
            <Anchor className="w-10 h-10 text-ddms-secondary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Chưa có bến tàu nào
            </h2>
            <p className="text-muted-foreground text-sm">
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
    <div className="min-h-[calc(100vh-4rem)] bg-ddms-bg-owner p-4 lg:p-8 font-sans text-foreground flex flex-col">
      <div className="mb-6 z-10 relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
            <Navigation className="w-8 h-8 text-ddms-secondary rotate-45" />
            {selectedDock ? selectedDock.name : 'Bản Đồ Bến Tàu'}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-ddms-secondary shrink-0" />
            {selectedDock?.location || 'Không có thông tin vị trí'} • Sức chứa:{' '}
            {selectedDock?.maxBoats} khoang neo đậu
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>{' '}
            {boats.filter((b) => b.status === 'running').length} Đang chạy
          </Badge>
          <Badge className="bg-muted text-muted-foreground border border-border px-3 py-1.5">
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
