import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../types';
import RoomDetailModal from './step-view-rooms/RoomDetailModal';
import RoomCard from './step-view-rooms/RoomCard';

interface StepViewRoomsProps {
  rooms: RoomOption[];
  selectedRoom: RoomOption | null;
  selectedBoatName: string;
  onSelectRoom: (room: RoomOption | null) => void;
}

export default function StepViewRooms({
  rooms,
  selectedRoom,
  selectedBoatName,
  onSelectRoom,
}: StepViewRoomsProps) {
  const { t } = useTranslation();
  const [detailRoom, setDetailRoom] = useState<RoomOption | null>(null);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {t('booking.rooms.title')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('booking.rooms.subtitle', { boat: selectedBoatName })}
      </p>

      <div className="mt-5 space-y-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isSelected={selectedRoom?.id === room.id}
            onToggle={() =>
              onSelectRoom(selectedRoom?.id === room.id ? null : room)
            }
            onViewDetail={() => setDetailRoom(room)}
          />
        ))}
      </div>

      {selectedRoom && (
        <div
          className="mt-4 rounded-xl p-3 flex items-center gap-3 border"
          style={{
            backgroundColor: 'var(--secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <Check size={16} className="text-ddms-secondary" />
          <span className="text-sm text-foreground">
            {t('booking.rooms.selected')}: <strong>{selectedRoom.name}</strong>{' '}
            — {formatPrice(selectedRoom.price)}
          </span>
        </div>
      )}

      {detailRoom && (
        <RoomDetailModal
          room={detailRoom}
          onClose={() => setDetailRoom(null)}
          onSelect={(room) =>
            onSelectRoom(selectedRoom?.id === room.id ? null : room)
          }
          isSelected={selectedRoom?.id === detailRoom.id}
        />
      )}
    </div>
  );
}
