import { Bed, Map as MapIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RouteRow from './RouteRow';
import RoomRow from './RoomRow';
import type { ServiceFormState, ServiceHandlers } from './types';

interface CruiseFieldsProps {
  service: ServiceFormState;
  handlers: ServiceHandlers;
}

const CruiseFields = ({ service, handlers }: CruiseFieldsProps) => (
  <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
    <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
      <MapIcon className="w-5 h-5" /> Lộ trình Tour Ngắn
    </h3>
    <div className="space-y-4">
      {service.routes.map((route, idx) => (
        <RouteRow
          key={idx}
          route={route}
          index={idx}
          badgeLabel="Chặng"
          onChange={(field, value) =>
            handlers.updateArrayItem(service.id, 'routes', idx, field, value)
          }
        />
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => handlers.addArrayItem(service.id, 'routes')}
        className="w-full border-dashed border-slate-700 bg-transparent text-cyan-400 hover:bg-slate-800"
      >
        <Plus className="w-4 h-4 mr-2" /> Thêm Chặng Mới
      </Button>
    </div>

    <div className="pt-4 border-t border-slate-800/50">
      <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2 mb-4">
        <Bed className="w-5 h-5" /> Danh sách Phòng Nghỉ (Tùy chọn)
      </h3>
      <div className="space-y-4">
        {service.rooms.map((room, idx) => (
          <RoomRow
            key={idx}
            room={room}
            onChange={(field, value) =>
              handlers.updateArrayItem(service.id, 'rooms', idx, field, value)
            }
            onUploadImage={(file) =>
              handlers.uploadImage(service.id, 'rooms', idx, file)
            }
          />
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => handlers.addArrayItem(service.id, 'rooms')}
          className="w-full border-dashed border-slate-700 bg-transparent text-purple-400 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm Hạng Phòng (Tùy chọn)
        </Button>
      </div>
    </div>
  </div>
);

export default CruiseFields;
