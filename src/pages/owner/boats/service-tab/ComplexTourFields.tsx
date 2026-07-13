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
  <div className="space-y-9 border-t border-border pt-7 mt-7">
    <div>
      <h3 className="text-xl font-semibold text-ddms-secondary flex items-center gap-2.5 mb-5">
        <MapIcon className="w-5 h-5" /> Lộ trình Tour Dài Ngày
      </h3>
      <div className="space-y-5">
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
          className="w-full border-dashed border-border bg-transparent text-ddms-secondary hover:bg-foreground/5 py-6 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm Chặng Mới
        </Button>
      </div>
    </div>

    <div>
      <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2.5 mb-5">
        <Bed className="w-5 h-5" /> Danh sách Phòng Nghỉ (Cabins)
      </h3>
      <div className="space-y-5">
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
          className="w-full border-dashed border-border bg-transparent text-purple-600 dark:text-purple-400 hover:bg-foreground/5 py-6 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm Hạng Phòng Mới
        </Button>
      </div>
    </div>
  </div>
);

export default ComplexTourFields;
