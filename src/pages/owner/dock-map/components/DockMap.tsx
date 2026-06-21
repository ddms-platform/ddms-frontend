import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import type { Dock } from '@/services/dockService';
import TopDownBoatSVG from './TopDownBoatSVG';
import type { DockSlot } from '../utils/slots';

interface BoatOnMap {
  id: string;
  name: string;
  x: number;
  y: number;
  rotate: number;
  hullColor: string;
  textColor: string;
  status?: string;
  slotName: string;
}

interface DockMapProps {
  selectedDock: Dock | null;
  activeSlots: DockSlot[];
  activeScheduledBoats: BoatOnMap[];
  boatsInDock: string[];
  onSelectBoat: (boat: any) => void;
}

const DockMap = ({
  selectedDock,
  activeSlots,
  activeScheduledBoats,
  boatsInDock,
  onSelectBoat,
}: DockMapProps) => (
  <div className="relative flex-1 min-h-150 xl:min-h-187.5 rounded-3xl border-4 border-[#1e293b] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#004e7c]">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0077a3] via-[#004e7c] to-[#002f4b]"></div>
    <div className="absolute top-0 left-0 w-full h-[30%] bg-linear-to-b from-white/10 to-transparent pointer-events-none"></div>
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

    <div className="absolute top-0 left-0 w-20 h-full bg-[#9ca3af] shadow-[15px_0_40px_rgba(0,0,0,0.7)] z-0 border-r-[6px] border-[#6b7280] flex flex-col justify-center items-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-80 mix-blend-multiply"></div>
      <div className="absolute top-0 right-2 w-1.5 h-full bg-yellow-400 opacity-80"></div>

      <div className="relative z-10 w-24 h-32 bg-slate-800 border-4 border-slate-700 shadow-2xl flex items-center justify-center -mr-12 rounded-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50"></div>
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/50 flex items-center justify-center">
          <Camera className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      </div>
    </div>

    {selectedDock && selectedDock.maxBoats > 0 && (
      <div
        className="absolute top-[20%] left-20 w-[82%] h-12 bg-[#8b5a2b] shadow-[0_15px_25px_rgba(0,0,0,0.5)] z-10 rounded-r-sm"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #8b5a2b, #8b5a2b 10px, #704620 10px, #704620 13px)',
        }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-50 mix-blend-multiply"></div>

        {[18, 28, 38, 48, 58, 68, 78, 88].map((pos, i) => {
          const hasTopSlot = selectedDock.maxBoats > i;
          const hasBottomSlot = selectedDock.maxBoats > i + 8;
          if (!hasTopSlot && !hasBottomSlot) return null;
          return (
            <div key={`fenderA${i}`}>
              {hasTopSlot && (
                <div
                  className="absolute -top-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                ></div>
              )}
              {hasBottomSlot && (
                <div
                  className="absolute -bottom-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
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
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                ></div>
              )}
              {hasBottomSlot && (
                <div
                  className="absolute -bottom-2 w-5 h-2 bg-slate-900 rounded-full border border-slate-700 shadow-md"
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
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
          left: `calc(${slot.x}% - 4%)`,
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
              onClick={() => onSelectBoat(boat)}
            >
              <div
                className="relative"
                style={{ transform: `rotate(${boat.rotate}deg)` }}
              >
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-16 h-20 bg-white/20 blur-xl rounded-full -z-10 group-hover:bg-cyan-300/40 transition-colors animate-pulse ${boat.rotate === 180 ? '-top-8' : '-bottom-8'}`}
                ></div>

                <div className="relative transition-transform group-hover:scale-115 duration-300">
                  <TopDownBoatSVG color={boat.hullColor} />
                </div>

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
                  <span className={`text-[9px] font-bold ${boat.textColor}`}>
                    {boat.status === 'running' ? 'HOẠT ĐỘNG' : 'ĐANG CHỜ'}
                  </span>
                </div>
              </div>
            </motion.div>
          ),
      )}
    </AnimatePresence>
  </div>
);

export default DockMap;
