import { Anchor } from 'lucide-react';
import type { Dock } from '@/services/dockService';
import type { BoatListItem } from '@/services/boatService';

interface BoatLocations {
  [id: string]: { dockName: string; slotName: string };
}

interface DockedBoat {
  id: string;
  name: string;
  slotName: string;
  startTime: string;
  endTime: string;
  [k: string]: any;
}

interface DockSidebarProps {
  docks: Dock[];
  selectedDockId: string;
  onSelectDock: (id: string) => void;
  capacity: number;
  occupancy: number;
  percent: number;
  activeTab: 'docked' | 'others';
  onTabChange: (tab: 'docked' | 'others') => void;
  activeScheduledBoats: DockedBoat[];
  otherBoats: BoatListItem[];
  boatLocations: BoatLocations;
  onSelectBoat: (boat: any) => void;
  formatScheduleTime: (iso: string) => string;
}

const DockSidebar = ({
  docks,
  selectedDockId,
  onSelectDock,
  capacity,
  occupancy,
  percent,
  activeTab,
  onTabChange,
  activeScheduledBoats,
  otherBoats,
  boatLocations,
  onSelectBoat,
  formatScheduleTime,
}: DockSidebarProps) => (
  <div className="w-full xl:w-95 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col gap-6 shrink-0 shadow-2xl justify-between">
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <Anchor className="w-3.5 h-3.5 text-cyan-400" /> Chọn Bến Neo Đậu
        </label>
        <div className="relative">
          <select
            value={selectedDockId}
            onChange={(e) => onSelectDock(e.target.value)}
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

      <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
        <button
          onClick={() => onTabChange('docked')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'docked'
              ? 'bg-cyan-500 text-slate-900 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
        >
          Đang neo ({activeScheduledBoats.length})
        </button>
        <button
          onClick={() => onTabChange('others')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'others'
              ? 'bg-cyan-500 text-slate-900 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
        >
          Tàu chưa ở bến này ({otherBoats.length})
        </button>
      </div>

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
                onClick={() => onSelectBoat(boat)}
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
                  onSelectBoat({
                    ...boat,
                    dockName: loc?.dockName,
                    slotName: loc?.slotName,
                  })
                }
                className="bg-slate-800/15 hover:bg-slate-800/45 border border-slate-900/60 hover:border-slate-800/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900/60 flex items-center justify-center shrink-0 border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-bold">⚓</span>
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
);

export default DockSidebar;
