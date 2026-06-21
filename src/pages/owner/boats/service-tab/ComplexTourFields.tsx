import { Bed, Map as MapIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RouteRow from './RouteRow';
import RoomRow from './RoomRow';
import type { ServiceFormState, ServiceHandlers } from './types';

interface ComplexTourFieldsProps {
  service: ServiceFormState;
  handlers: ServiceHandlers;
}

const ComplexTourFields = ({ service, handlers }: ComplexTourFieldsProps) => (
  <div className="space-y-8 border-t border-slate-800 pt-6 mt-6">
    <div>
      <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5" /> Lộ trình Tour Dài Ngày
      </h3>
      <div className="space-y-4">
        {service.routes.map((route, idx) => (
          <RouteRow
            key={idx}
            route={route}
            index={idx}
            badgeLabel="Ngày / Chặng"
            namePlaceholder="VD: Ngày 1: Đón khách & Nhận phòng"
            endPlaceholder="Bán Đảo Sơn Trà"
            descriptionPlaceholder="VD: Khởi hành tại bến, di chuyển tham quan Vịnh Đà Nẵng, ăn trưa trên tàu..."
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
    </div>

    <div>
      <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2 mb-4">
        <Bed className="w-5 h-5" /> Danh sách Phòng Nghỉ (Cabins)
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
          <Plus className="w-4 h-4 mr-2" /> Thêm Hạng Phòng Mới
        </Button>
      </div>
    </div>
  </div>
);

export default ComplexTourFields;
