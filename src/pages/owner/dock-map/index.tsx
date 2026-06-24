import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Anchor,
  X,
  Layers,
  Droplets,
  Camera,
  MapPin,
  Navigation,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { boatService, type BoatListItem } from '@/services/boatService';
import { dockService, type Dock } from '@/services/dockService';

// Generate 32 slots: 8 slots per side for 2 piers
const generateSlots = () => {
  const slots = [];
  const startX = 18;
  const gapX = 10; // 8 slots from 18 to 88

  // Pier A (Top: 20%, Bottom: 20%) -> Boats at 8% and 32%
  for (let i = 0; i < 8; i++) {
    slots.push({
      id: `A${i + 1}`,
      x: startX + i * gapX,
      y: 8,
      rotate: 180,
      pier: 'Cầu tàu A (Phía trên)',
    });
    slots.push({
      id: `A${i + 9}`,
      x: startX + i * gapX,
      y: 32,
      rotate: 0,
      pier: 'Cầu tàu A (Phía dưới)',
    });
  }

  // Pier B (Top: 65%, Bottom: 65%) -> Boats at 53% and 77%
  for (let i = 0; i < 8; i++) {
    slots.push({
      id: `B${i + 1}`,
      x: startX + i * gapX,
      y: 53,
      rotate: 180,
      pier: 'Cầu tàu B (Phía trên)',
    });
    slots.push({
      id: `B${i + 9}`,
      x: startX + i * gapX,
      y: 77,
      rotate: 0,
      pier: 'Cầu tàu B (Phía dưới)',
    });
  }

  return slots;
};

const ALL_SLOTS = generateSlots();

const TopDownBoatSVG = ({ color }: { color: string }) => (
  <svg
    viewBox="0 0 100 280"
    className="w-8 sm:w-10 md:w-12 h-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
  >
    {/* Hull */}
    <path
      d="M 50 0 C 95 60, 90 220, 85 260 L 15 260 C 10 220, 5 60, 50 0 Z"
      fill={color}
      stroke="#ffffff"
      strokeWidth="3"
    />
    {/* Sun Deck (Front) */}
    <path
      d="M 50 30 C 75 60, 75 90, 75 90 L 25 90 C 25 90, 25 60, 50 30 Z"
      fill="#e2e8f0"
    />
    {/* Cockpit Roof */}
    <path
      d="M 20 100 L 80 100 L 75 220 L 25 220 Z"
      fill="#f8fafc"
      stroke="#94a3b8"
      strokeWidth="2"
    />
    {/* Windshield */}
    <path
      d="M 25 105 Q 50 85, 75 105 L 70 120 Q 50 105, 30 120 Z"
      fill="#0ea5e9"
      opacity="0.8"
    />
    {/* Rear Deck */}
    <rect x="25" y="220" width="50" height="35" fill="#cbd5e1" />
    {/* Outboard Motors */}
    <rect x="30" y="260" width="12" height="15" fill="#1e293b" rx="2" />
    <rect x="58" y="260" width="12" height="15" fill="#1e293b" rx="2" />
  </svg>
);

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

  // Pre-calculate positions of all owner boats across all docks in the system
  const boatLocations = useMemo(() => {
    const locations: Record<string, { dockName: string; slotName: string }> =
      {};
    const now = new Date();

    docks.forEach((dock) => {
      // Find active schedules for this dock
      const activeSchedules = (dock.schedules || []).filter((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return start <= now && end >= now;
      });

      // Map sequentially
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

  // Active scheduled boats of the current owner at the selected dock
  const activeScheduledBoats = useMemo(() => {
    if (!selectedDock) return [];
    const now = new Date();

    // Get active schedules at the selected dock
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

  // Owner's boats that are NOT docked at the selected dock right now
  const otherBoats = useMemo(() => {
    return boats.filter(
      (b) => !activeScheduledBoats.some((asb) => asb.id === b.id),
    );
  }, [boats, activeScheduledBoats]);

  // Active slots for the selected dock based on maxBoats capacity
  const activeSlots = useMemo(() => {
    if (!selectedDock) return [];
    return ALL_SLOTS.slice(0, selectedDock.maxBoats);
  }, [selectedDock]);

  // Trigger animations when the selected dock or active scheduled boats change
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
    } catch (e) {
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
      {/* Header */}
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

      {/* Main Two-Column Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch flex-1 w-full max-w-400 mx-auto">
        {/* Left Side: Map View */}
        <div className="relative flex-1 min-h-150 xl:min-h-187.5 rounded-3xl border-4 border-[#1e293b] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#004e7c]">
          {/* Animated Water Background - Deeper Ocean */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0077a3] via-[#004e7c] to-[#002f4b]"></div>

          {/* Sunlight Reflection on water */}
          <div className="absolute top-0 left-0 w-full h-[30%] bg-linear-to-b from-white/10 to-transparent pointer-events-none"></div>

          {/* Water caustic/ripple texture */}
          <div
            className="absolute inset-0 opacity-15 mix-blend-color-dodge pointer-events-none"
            style={{
              backgroundImage:
                'url("https://www.transparenttextures.com/patterns/water.png")',
              animation: 'drift 25s linear infinite',
            }}
          ></div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes drift {
              from { background-position: 0 0; }
              to { background-position: 200px 200px; }
            }
          `,
            }}
          />

          {/* --- PHYSICAL PORT ENVIRONMENT --- */}

          {/* Mainland (Left Edge - Harbor Master Building & Concrete) */}
          <div className="absolute top-0 left-0 w-20 h-full bg-[#9ca3af] shadow-[15px_0_40px_rgba(0,0,0,0.7)] z-0 border-r-[6px] border-[#6b7280] flex flex-col justify-center items-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-80 mix-blend-multiply"></div>
            <div className="absolute top-0 right-2 w-1.5 h-full bg-yellow-400 opacity-80"></div>

            {/* Harbor Master Building Roof (Center left) */}
            <div className="relative z-10 w-24 h-32 bg-slate-800 border-4 border-slate-700 shadow-2xl flex items-center justify-center -mr-12 rounded-lg">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50"></div>
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500/50 flex items-center justify-center">
                <Camera className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* PIER A (Top - Dual Sided) */}
          {selectedDock && selectedDock.maxBoats > 0 && (
            <div
              className="absolute top-[20%] left-20 w-[82%] h-12 bg-[#8b5a2b] shadow-[0_15px_25px_rgba(0,0,0,0.5)] z-10 rounded-r-sm"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #8b5a2b, #8b5a2b 10px, #704620 10px, #704620 13px)',
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-50 mix-blend-multiply"></div>

              {/* Fenders (Top and Bottom edges) */}
              {[18, 28, 38, 48, 58, 68, 78, 88].map((pos, i) => {
                const hasTopSlot = selectedDock.maxBoats > i;
                const hasBottomSlot = selectedDock.maxBoats > i + 8;
                if (!hasTopSlot && !hasBottomSlot) return null;
                return (
                  <div key={`fenderA${i}`}>
                    {hasTopSlot && (
                      <div
                        className="absolute -top-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                        style={{
                          left: `${pos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    )}
                    {hasBottomSlot && (
                      <div
                        className="absolute -bottom-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                        style={{
                          left: `${pos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    )}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-400 rounded-sm shadow-inner"
                      style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                    ></div>
                  </div>
                );
              })}

              <span className="absolute top-1/2 -translate-y-1/2 left-6 text-white/90 font-black tracking-[0.3em] text-sm drop-shadow-md bg-slate-900/40 px-2 rounded">
                CẦU TẢU A
              </span>
            </div>
          )}

          {/* PIER B (Bottom - Dual Sided) */}
          {selectedDock && selectedDock.maxBoats > 16 && (
            <div
              className="absolute top-[65%] left-20 w-[82%] h-12 bg-[#8b5a2b] shadow-[0_15px_25px_rgba(0,0,0,0.5)] z-10 rounded-r-sm"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #8b5a2b, #8b5a2b 10px, #704620 10px, #704620 13px)',
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-50 mix-blend-multiply"></div>

              {[18, 28, 38, 48, 58, 68, 78, 88].map((pos, i) => {
                const hasTopSlot = selectedDock.maxBoats > i + 16;
                const hasBottomSlot = selectedDock.maxBoats > i + 24;
                if (!hasTopSlot && !hasBottomSlot) return null;
                return (
                  <div key={`fenderB${i}`}>
                    {hasTopSlot && (
                      <div
                        className="absolute -top-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                        style={{
                          left: `${pos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    )}
                    {hasBottomSlot && (
                      <div
                        className="absolute -bottom-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                        style={{
                          left: `${pos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    )}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-400 rounded-sm shadow-inner"
                      style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                    ></div>
                  </div>
                );
              })}

              <span className="absolute top-1/2 -translate-y-1/2 left-6 text-white/90 font-black tracking-[0.3em] text-sm drop-shadow-md bg-slate-900/40 px-2 rounded">
                CẦU TẢU B
              </span>
            </div>
          )}

          {/* Water Parking Bays based on Dock Capacity */}
          {activeSlots.map((slot, idx) => (
            <div
              key={`bay-${idx}`}
              className="absolute border-x border-dashed border-white/20 z-0 flex justify-center pb-2 pt-2 animate-fade-in"
              style={{
                top:
                  slot.y < 20
                    ? '4%'
                    : slot.y < 40
                      ? '24%'
                      : slot.y < 60
                        ? '49%'
                        : '69%',
                left: `calc(${slot.x}% - 4%)`, // 8% width bay
                width: '8%',
                height: '16%',
                alignItems: slot.rotate === 180 ? 'flex-start' : 'flex-end',
              }}
            >
              <span className="text-white/40 font-bold text-sm bg-slate-900/20 px-1 rounded">
                {slot.id}
              </span>
            </div>
          ))}

          {/* --- ANIMATED BOATS ON MAP --- */}
          <AnimatePresence>
            {activeScheduledBoats.map(
              (boat) =>
                boatsInDock.includes(boat.id) && (
                  <motion.div
                    key={boat.id}
                    initial={{ opacity: 0, x: 200, scale: 0 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                    className="absolute z-20 cursor-pointer group"
                    style={{
                      top: `${boat.y}%`,
                      left: `${boat.x}%`,
                      transform: `translate(-50%, -50%)`,
                    }}
                    onClick={() => setSelectedBoat(boat)}
                  >
                    {/* Rotated Wrapper for Boat & Wake ONLY */}
                    <div
                      className="relative"
                      style={{ transform: `rotate(${boat.rotate}deg)` }}
                    >
                      {/* Water Ripple Wake */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-16 h-20 bg-white/20 blur-xl rounded-full -z-10 group-hover:bg-cyan-300/40 transition-colors animate-pulse ${boat.rotate === 180 ? '-top-8' : '-bottom-8'}`}
                      ></div>

                      {/* Realistic Boat SVG */}
                      <div className="relative transition-transform group-hover:scale-115 duration-300">
                        <TopDownBoatSVG color={boat.hullColor} />
                      </div>

                      {/* Simulated Mooring Lines (Ropes) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <svg
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 -mt-10 pointer-events-none z-[-1]"
                          style={{ overflow: 'visible' }}
                        >
                          <line
                            x1="10"
                            y1="50"
                            x2="10"
                            y2="20"
                            stroke="rgba(255,255,255,0.6)"
                            strokeWidth="1.5"
                            strokeDasharray="3,2"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Floating Info Badge on Hover (Stays Upright) */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 bg-slate-900/95 px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none scale-90 group-hover:scale-100 ${boat.rotate === 180 ? 'top-10' : '-top-14'}`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5">
                        {boat.name} ({boat.slotName})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${boat.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
                        ></span>
                        <span
                          className={`text-[9px] font-bold ${boat.textColor}`}
                        >
                          {boat.status === 'running' ? 'HOẠT ĐỘNG' : 'ĐANG CHỜ'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Sidebar Controller */}
        <div className="w-full xl:w-95 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col gap-6 shrink-0 shadow-2xl justify-between">
          <div className="flex flex-col gap-6">
            {/* Dock Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5 text-cyan-400" /> Chọn Bến Neo
                Đậu
              </label>
              <div className="relative">
                <select
                  value={selectedDockId}
                  onChange={(e) => setSelectedDockId(e.target.value)}
                  className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer transition-all"
                >
                  {docks.map((dock) => (
                    <option
                      key={dock.id}
                      value={dock.id}
                      className="bg-slate-900 text-white"
                    >
                      {dock.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Occupancy Indicator Card */}
            <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Sức chứa bến</span>
                <span className="text-white font-bold">{capacity} thuyền</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">
                  Tàu thuộc sở hữu đang neo
                </span>
                <span className="text-cyan-400 font-bold">{occupancy} tàu</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-1">
                <div className="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      percent > 85
                        ? 'bg-rose-500'
                        : percent > 50
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex justify-between items-center">
                <span>Hiệu suất lấp đầy: {percent}%</span>
                <span>
                  {capacity - occupancy > 0
                    ? `Trống ${capacity - occupancy} khoang`
                    : 'Đầy'}
                </span>
              </div>
            </div>

            {/* Tabs Trigger */}
            <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
              <button
                onClick={() => setActiveTab('docked')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'docked'
                    ? 'bg-cyan-500 text-slate-900 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                }`}
              >
                Đang neo ({activeScheduledBoats.length})
              </button>
              <button
                onClick={() => setActiveTab('others')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'others'
                    ? 'bg-cyan-500 text-slate-900 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                }`}
              >
                Tàu chưa ở bến này ({otherBoats.length})
              </button>
            </div>

            {/* Tab Contents: Scrollable list */}
            <div className="overflow-y-auto max-h-90 pr-1 space-y-2.5">
              {activeTab === 'docked' ? (
                activeScheduledBoats.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500 font-medium border border-dashed border-slate-800 rounded-2xl">
                    Chưa có tàu nào có lịch neo đậu
                    <br />
                    hoạt động tại bến này lúc này.
                  </div>
                ) : (
                  activeScheduledBoats.map((boat) => (
                    <div
                      key={boat.id}
                      onClick={() => setSelectedBoat(boat)}
                      className="bg-slate-800/35 hover:bg-slate-800/75 border border-slate-800/60 hover:border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/15 group-hover:bg-cyan-500/20 transition-all">
                        <Anchor className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {boat.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-cyan-400 bg-cyan-500/10 px-1 rounded">
                            Khoang {boat.slotName}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {formatScheduleTime(boat.startTime)} -{' '}
                            {formatScheduleTime(boat.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : otherBoats.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 font-medium border border-dashed border-slate-800 rounded-2xl">
                  Tất cả tàu của bạn đã neo tại đây.
                </div>
              ) : (
                otherBoats.map((boat) => {
                  const loc = boatLocations[boat.id];
                  return (
                    <div
                      key={boat.id}
                      onClick={() =>
                        setSelectedBoat({
                          ...boat,
                          dockName: loc?.dockName,
                          slotName: loc?.slotName,
                        })
                      }
                      className="bg-slate-800/15 hover:bg-slate-800/45 border border-slate-900/60 hover:border-slate-800/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-900/60 flex items-center justify-center shrink-0 border border-slate-800/50">
                        <span className="text-slate-500 text-xs font-bold">
                          ⚓
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-300 truncate">
                          {boat.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${boat.status === 'running' ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          ></span>
                          {loc ? (
                            <span className="text-amber-500 font-semibold truncate">
                              Neo tại: {loc.dockName}
                            </span>
                          ) : (
                            <span>Chưa xếp lịch bến</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 text-center font-medium">
            Lịch neo đậu tự động đồng bộ theo thời gian thực
          </div>
        </div>
      </div>

      {/* --- BOAT DETAIL SLIDE-OVER MODAL --- */}
      <AnimatePresence>
        {selectedBoat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBoat(null)}
              className="fixed inset-0 bg-[#0B132B]/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-112.5 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col"
            >
              {/* Cover Image Area */}
              <div className="h-64 relative bg-slate-800">
                {selectedBoat.thumbnailUrl ? (
                  <img
                    src={selectedBoat.thumbnailUrl}
                    alt={selectedBoat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#004e7c] to-slate-900">
                    <TopDownBoatSVG color="#ffffff" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedBoat(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-slate-900 to-transparent"></div>
              </div>

              {/* Details Content */}
              <div className="p-6 flex-1 overflow-y-auto -mt-8 relative z-10">
                <Badge
                  className={`${selectedBoat.status === 'running' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'} border-none text-white shadow-lg mb-4 px-4 py-1 text-xs`}
                >
                  {selectedBoat.status === 'running'
                    ? 'ĐANG HOẠT ĐỘNG'
                    : 'CHỜ / BẢO TRÌ'}
                </Badge>

                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedBoat.name}
                </h2>
                <p className="text-cyan-400 text-sm font-medium mb-6 capitalize tracking-wide">
                  {selectedBoat.type || 'Hạng mục: Chưa phân loại'}
                </p>

                <div className="grid gap-4 mb-8">
                  <div className="flex items-center gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <Anchor className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                        Vị trí neo đậu hiện tại
                      </p>
                      <p className="text-white font-semibold text-base">
                        {selectedBoatLocation
                          ? `${selectedBoatLocation.dockName}${selectedBoatLocation.slotName ? ` - Khoang ${selectedBoatLocation.slotName}` : ''}`
                          : selectedBoat.dockName
                            ? `${selectedBoat.dockName}${selectedBoat.slotName ? ` - Khoang ${selectedBoat.slotName}` : ''}`
                            : 'Chưa xếp bến'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                        Sức chứa tối đa
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {selectedBoat.maxPassengers} Hành khách •{' '}
                        {selectedBoat.cabinCount} Cabins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Droplets className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                        Hệ thống dịch vụ
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {selectedBoat.serviceCount} Dịch vụ đang cung cấp
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl mt-auto">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-7 text-base rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-1">
                  <Camera className="w-6 h-6 mr-3" />
                  KẾT NỐI CAMERA GIÁM SÁT
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
