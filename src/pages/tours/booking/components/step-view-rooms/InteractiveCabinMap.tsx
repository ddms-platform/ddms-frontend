import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { BedDouble, Check, Loader2, Ship, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import cockpitForward from '@/assets/boat-360/cockpit-forward.jpg';
import cockpitHelm from '@/assets/boat-360/cockpit-helm.jpg';
import cockpitConsole from '@/assets/boat-360/cockpit-console.jpg';
import aftDeck from '@/assets/boat-360/aft-deck.jpg';
import type { RoomOption } from '../../types';

interface InteractiveCabinMapProps {
  rooms: RoomOption[];
  selectedRoom: RoomOption | null;
  boatImageUrls?: string[];
  isLoading?: boolean;
  onSelectRoom: (room: RoomOption) => void;
}

interface CabinSlot {
  room: RoomOption;
  unitIndex: number;
  unitLabel: string;
  cabinNumber: string;
  isBooked: boolean;
  isSelected: boolean;
}

const deckNames = ['Tầng chính', 'Tầng trên', 'Tầng VIP'];

const demoBoatSceneImages = [
  cockpitForward,
  cockpitHelm,
  cockpitConsole,
  aftDeck,
];

const getDeckCount = (slotCount: number) => {
  if (slotCount > 24) return 3;
  if (slotCount > 10) return 2;
  return 1;
};

const getRoomInitial = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const getRoomTone = (type: RoomOption['type']) => {
  if (type === 'vip') {
    return {
      empty:
        'border-amber-400/40 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25',
      selected:
        'border-amber-300 bg-amber-300 text-slate-950 shadow-md shadow-amber-300/20',
    };
  }

  if (type === 'deluxe') {
    return {
      empty: 'border-sky-400/40 bg-sky-400/15 text-sky-200 hover:bg-sky-400/25',
      selected:
        'border-sky-300 bg-sky-300 text-slate-950 shadow-md shadow-sky-300/20',
    };
  }

  return {
    empty:
      'border-emerald-400/40 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25',
    selected:
      'border-ddms-secondary bg-ddms-secondary text-primary-foreground shadow-md shadow-cyan-500/20',
  };
};

export default function InteractiveCabinMap({
  rooms,
  selectedRoom,
  boatImageUrls,
  isLoading,
  onSelectRoom,
}: InteractiveCabinMapProps) {
  const slots = rooms.flatMap((room) => {
    const totalRooms = Math.max(room.totalRooms, 1);
    const bookedRooms = Math.min(room.bookedRooms ?? 0, totalRooms);

    return Array.from({ length: totalRooms }, (_, index) => {
      const unitIndex = index + 1;
      const isBooked = unitIndex <= bookedRooms;
      const isSelected =
        selectedRoom?.id === room.id &&
        selectedRoom.selectedUnitIndex === unitIndex;

      return {
        room,
        unitIndex,
        unitLabel: `${room.name} ${unitIndex}`,
        cabinNumber: '',
        isBooked,
        isSelected,
      };
    });
  });

  const deckCount = getDeckCount(slots.length);
  const slotsPerDeck = Math.ceil(slots.length / deckCount) || 1;
  const decks = Array.from({ length: deckCount }, (_, deckIndex) =>
    slots.slice(deckIndex * slotsPerDeck, (deckIndex + 1) * slotsPerDeck).map(
      (slot, slotIndex) =>
        ({
          ...slot,
          cabinNumber: `${deckIndex + 1}${String(slotIndex + 1).padStart(
            2,
            '0',
          )}`,
        }) satisfies CabinSlot,
    ),
  ).filter((deck) => deck.length > 0);

  return (
    <section
      className="mt-5 rounded-xl border p-4"
      style={{
        backgroundColor: 'var(--ddms-bg-main)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Sơ đồ 2D toàn bộ cabin
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Xem toàn bộ phòng theo mặt bằng tàu. Chọn phòng còn trống trên sơ đồ
            để giữ chỗ.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-ddms-secondary" />
            Đang chọn
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            Còn trống
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-rose-500" />
            Đã đặt
          </span>
        </div>
      </div>

      {!isLoading && slots.length > 0 && (
        <VirtualBoatCamera
          slots={slots}
          boatImageUrls={boatImageUrls}
          onSelectRoom={onSelectRoom}
        />
      )}

      <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
        <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Ship size={14} className="text-ddms-secondary" />
          Mũi tàu
        </div>

        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-ddms-secondary" />
            Đang tải trạng thái cabin...
          </div>
        ) : slots.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
            Chưa có cabin cho lịch trình này.
          </div>
        ) : (
          <div className="space-y-4">
            {decks.map((deck, deckIndex) => {
              const portSlots = deck.filter((_, index) => index % 2 === 0);
              const starboardSlots = deck.filter((_, index) => index % 2 === 1);

              return (
                <div
                  key={deckIndex}
                  className="overflow-hidden rounded-[28px] border border-cyan-400/20 bg-slate-950/40"
                >
                  <div className="grid grid-cols-[52px_1fr_18px_1fr_52px] gap-2 p-3 sm:grid-cols-[72px_1fr_22px_1fr_72px]">
                    <div className="flex items-center justify-center rounded-l-full border border-cyan-400/20 bg-cyan-400/10 px-2 text-center text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                      Mũi
                    </div>

                    <div className="grid content-start gap-2">
                      <DeckSide
                        slots={portSlots}
                        side="left"
                        onSelectRoom={onSelectRoom}
                      />
                    </div>

                    <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-full border border-dashed border-cyan-300/25 bg-cyan-300/5 px-1 text-center text-[9px] font-semibold uppercase tracking-wider text-cyan-200/80 [writing-mode:vertical-rl]">
                      Hành lang
                    </div>

                    <div className="grid content-start gap-2">
                      <DeckSide
                        slots={starboardSlots}
                        side="right"
                        onSelectRoom={onSelectRoom}
                      />
                    </div>

                    <div className="flex items-center justify-center rounded-r-full border border-cyan-400/20 bg-cyan-400/10 px-2 text-center text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                      Đuôi
                    </div>
                  </div>

                  <div className="border-t border-cyan-400/10 px-4 py-2 text-center text-[11px] font-semibold text-muted-foreground">
                    {deckNames[deckIndex] || `Tầng ${deckIndex + 1}`} ·{' '}
                    {deck.length} phòng
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function VirtualBoatCamera({
  slots,
  boatImageUrls,
  onSelectRoom,
}: {
  slots: CabinSlot[];
  boatImageUrls?: string[];
  onSelectRoom: (room: RoomOption) => void;
}) {
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({
    pointerX: 0,
    pointerY: 0,
    cameraX: 0,
    cameraY: 0,
  });
  const sceneImages = useMemo(() => {
    const uploadedBoatImages = (boatImageUrls || []).filter(Boolean);
    const roomImages = slots
      .map((slot) => slot.room.images?.[0])
      .filter((image): image is string => Boolean(image));

    return uploadedBoatImages.length > 0
      ? uploadedBoatImages
      : [...demoBoatSceneImages, ...roomImages].slice(0, 6);
  }, [boatImageUrls, slots]);

  const visibleSlots = useMemo(
    () =>
      slots.map((slot, index) => {
        const lane = index % 3;
        const row = Math.floor(index / 3);
        const left = 22 + ((index * 19) % 56);
        const top = 44 + lane * 12 + (row % 2) * 4;

        return {
          ...slot,
          left,
          top,
        };
      }),
    [slots],
  );
  const sceneCount = Math.max(sceneImages.length, 1);
  const panProgress = (camera.x + 28) / 56;
  const imageTranslate = -panProgress * ((sceneCount - 1) / sceneCount) * 100;

  const updateCamera = (nextX: number, nextY: number) => {
    setCamera({
      x: Math.max(-28, Math.min(28, nextX)),
      y: Math.max(-10, Math.min(10, nextY)),
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      cameraX: camera.x,
      cameraY: camera.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStart.current.pointerX;
    const deltaY = event.clientY - dragStart.current.pointerY;
    updateCamera(
      dragStart.current.cameraX + deltaX * 0.08,
      dragStart.current.cameraY + deltaY * 0.04,
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-cyan-400/20 bg-slate-950">
      <div
        className={[
          'relative h-80 touch-none overflow-hidden select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="absolute inset-0 bg-slate-950">
          <div
            className="absolute inset-y-0 left-0 flex transition-transform duration-75"
            style={{
              width: `${sceneCount * 100}%`,
              transform: `translate3d(${imageTranslate}%, ${camera.y}%, 0)`,
            }}
          >
            {sceneImages.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`Không gian thuyền ${index + 1}`}
                className="h-full flex-1 object-cover"
                draggable={false}
                onError={(event) => {
                  event.currentTarget.src = cockpitForward;
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/10 via-slate-950/15 to-slate-950/60" />
          <div className="absolute inset-x-0 bottom-0 h-18 bg-linear-to-t from-slate-950 to-transparent" />
        </div>

        {visibleSlots.map((slot, index) => {
          const tone = getRoomTone(slot.room.type);
          const className = slot.isBooked
            ? 'border-rose-400 bg-rose-500 text-white'
            : slot.isSelected
              ? tone.selected
              : tone.empty;

          return (
            <button
              key={`${slot.room.id}-${slot.unitIndex}-camera`}
              type="button"
              disabled={slot.isBooked}
              title={`${slot.unitLabel} · ${formatPrice(slot.room.price)}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() =>
                onSelectRoom({
                  ...slot.room,
                  selectedUnitIndex: slot.unitIndex,
                  selectedUnitLabel: `${slot.unitLabel} - góc nhìn ảo`,
                })
              }
              className={[
                'absolute z-10 flex min-w-22 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-2 text-left text-[10px] font-bold shadow-xl backdrop-blur-md transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-85',
                className,
              ].join(' ')}
              style={{
                left: `${slot.left}%`,
                top: `${slot.top}%`,
              }}
              aria-label={`${slot.unitLabel} trong không gian ảo`}
            >
              {slot.isBooked ? (
                <X size={13} />
              ) : slot.isSelected ? (
                <Check size={13} />
              ) : (
                <BedDouble size={13} />
              )}
              <span className="flex flex-col leading-tight">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="max-w-20 truncate opacity-80">
                  {getRoomInitial(slot.room.name)}
                </span>
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full border border-cyan-300/25 bg-slate-950/70 px-3 py-1 text-[11px] font-bold text-cyan-100 backdrop-blur">
            Virtual deck view
          </span>
          <span className="rounded-full border border-cyan-300/25 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-cyan-100 backdrop-blur">
            {Math.round(camera.x + 50)}°
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-8 bottom-5 h-1 rounded-full bg-white/10">
          <div
            className="h-full w-14 rounded-full bg-ddms-secondary transition-transform"
            style={{ transform: `translateX(${camera.x + 28}%)` }}
          />
        </div>
      </div>
    </div>
  );
}

function DeckSide({
  slots,
  side,
  onSelectRoom,
}: {
  slots: CabinSlot[];
  side: 'left' | 'right';
  onSelectRoom: (room: RoomOption) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const tone = getRoomTone(slot.room.type);
        const className = slot.isBooked
          ? 'cursor-not-allowed border-rose-500/40 bg-rose-500/90 text-white opacity-90'
          : slot.isSelected
            ? tone.selected
            : `${tone.empty} active:scale-95`;

        return (
          <button
            key={`${slot.room.id}-${slot.unitIndex}-${side}`}
            type="button"
            disabled={slot.isBooked}
            title={`${slot.unitLabel} · ${formatPrice(slot.room.price)}`}
            onClick={() =>
              onSelectRoom({
                ...slot.room,
                selectedUnitIndex: slot.unitIndex,
                selectedUnitLabel: `${slot.unitLabel} - phòng ${slot.cabinNumber}`,
              })
            }
            className={[
              'flex min-h-17 flex-col justify-between rounded-lg border p-2 text-left transition-all hover:-translate-y-0.5',
              className,
            ].join(' ')}
            aria-label={`${slot.unitLabel} phòng ${slot.cabinNumber}`}
          >
            <span className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black">{slot.cabinNumber}</span>
              {slot.isBooked ? (
                <X size={12} />
              ) : slot.isSelected ? (
                <Check size={12} />
              ) : (
                <BedDouble size={12} />
              )}
            </span>
            <span className="truncate text-[10px] font-semibold">
              {getRoomInitial(slot.room.name)}
            </span>
            <span className="truncate text-[9px] opacity-80">
              {slot.room.maxAdults} khách
            </span>
          </button>
        );
      })}
    </div>
  );
}
