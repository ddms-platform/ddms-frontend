import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { RoomOption } from '../types';
import RoomDetailModal from './step-view-rooms/RoomDetailModal';
import InteractiveCabinMap from './step-view-rooms/InteractiveCabinMap';
import RoomCard from './step-view-rooms/RoomCard';

interface StepViewRoomsProps {
  rooms: RoomOption[];
  selectedRoom: RoomOption | null;
  selectedBoatName: string;
  boatImageUrls?: string[];
  isAvailabilityLoading?: boolean;
  onSelectRoom: (room: RoomOption | null) => void;
}

export default function StepViewRooms({
  rooms,
  selectedRoom,
  selectedBoatName,
  boatImageUrls,
  isAvailabilityLoading,
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

      <InteractiveCabinMap
        rooms={rooms}
        selectedRoom={selectedRoom}
        boatImageUrls={boatImageUrls}
        isLoading={isAvailabilityLoading}
        onSelectRoom={onSelectRoom}
      />

      <div className="mt-5 space-y-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isSelected={selectedRoom?.id === room.id}
            disabled={room.availableRooms <= 0}
            onToggle={() =>
              onSelectRoom(
                selectedRoom?.id === room.id
                  ? null
                  : {
                      ...room,
                      selectedUnitIndex: (room.bookedRooms ?? 0) + 1,
                      selectedUnitLabel: `${room.name} ${
                        (room.bookedRooms ?? 0) + 1
                      }`,
                    },
              )
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
            {selectedRoom.selectedUnitLabel
              ? `(${selectedRoom.selectedUnitLabel})`
              : ''}{' '}
            — {formatPrice(selectedRoom.price)}
          </span>
        </div>
      )}

      {detailRoom && (
        <RoomDetailModal
          room={detailRoom}
          onClose={() => setDetailRoom(null)}
          onSelect={(room) =>
            onSelectRoom(
              selectedRoom?.id === room.id
                ? null
                : {
                    ...room,
                    selectedUnitIndex: (room.bookedRooms ?? 0) + 1,
                    selectedUnitLabel: `${room.name} ${
                      (room.bookedRooms ?? 0) + 1
                    }`,
                  },
            )
          }
          isSelected={selectedRoom?.id === detailRoom.id}
        />
      )}
    </div>
  );
}
