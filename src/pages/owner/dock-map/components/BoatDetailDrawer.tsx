import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, X, Layers, Droplets, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TopDownBoatSVG from './TopDownBoatSVG';

interface BoatDetail {
  id: string;
  name: string;
  status?: string;
  type?: string;
  thumbnailUrl?: string;
  maxPassengers?: number;
  cabinCount?: number;
  serviceCount?: number;
  dockName?: string;
  slotName?: string;
  [k: string]: any;
}

interface BoatDetailDrawerProps {
  boat: BoatDetail | null;
  location: { dockName: string; slotName: string } | null;
  onClose: () => void;
}

const BoatDetailDrawer = ({
  boat,
  location,
  onClose,
}: BoatDetailDrawerProps) => (
  <AnimatePresence>
    {boat && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B132B]/80 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-112.5 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col"
        >
          <div className="h-64 relative bg-slate-800">
            {boat.thumbnailUrl ? (
              <img
                src={boat.thumbnailUrl}
                alt={boat.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#004e7c] to-slate-900">
                <TopDownBoatSVG color="#ffffff" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-slate-900 to-transparent"></div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto -mt-8 relative z-10">
            <Badge
              className={`${boat.status === 'running' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'} border-none text-white shadow-lg mb-4 px-4 py-1 text-xs`}
            >
              {boat.status === 'running' ? 'ĐANG HOẠT ĐỘNG' : 'CHỜ / BẢO TRÌ'}
            </Badge>

            <h2 className="text-3xl font-bold text-white mb-2">{boat.name}</h2>
            <p className="text-cyan-400 text-sm font-medium mb-6 capitalize tracking-wide">
              {boat.type || 'Hạng mục: Chưa phân loại'}
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
                    {location
                      ? `${location.dockName}${location.slotName ? ` - Khoang ${location.slotName}` : ''}`
                      : boat.dockName
                        ? `${boat.dockName}${boat.slotName ? ` - Khoang ${boat.slotName}` : ''}`
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
                    {boat.maxPassengers} Hành khách • {boat.cabinCount} Cabins
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
                    {boat.serviceCount} Dịch vụ đang cung cấp
                  </p>
                </div>
              </div>
            </div>
          </div>

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
);

export default BoatDetailDrawer;
