import { Ship, Users, DoorOpen, Layers, Pencil, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/badges';
import type { Boat } from '@/services/boatService';

interface BoatCardProps {
  boat: Boat;
  onDelete: (id: string) => void;
}

export default function BoatCard({ boat, onDelete }: BoatCardProps) {
  const { t } = useTranslation();
  const hasActiveMaintenance = boat.maintenances.some((m) => new Date(m.endTime) > new Date());

  return (
    <div
      className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
      style={{
        backgroundColor: '#112240',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: 'rgba(0,0,0,0.08) 0px 2px 8px',
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {boat.images[0] ? (
          <img
            src={boat.images[0].imageUrl}
            alt={boat.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,240,255,0.04)' }}
          >
            <Ship size={48} style={{ color: 'rgba(0,240,255,0.3)' }} />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <StatusBadge
            label={t(`ownerBoats.status.${boat.status}`)}
            variant={boat.status === 'running' ? 'ownerRunning' : 'ownerIdle'}
          />
        </div>

        {hasActiveMaintenance && (
          <div className="absolute top-3 right-3">
            <StatusBadge label={t('ownerBoats.card.maintenance')} variant="ownerMaintenance" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div>
          <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>
            {boat.name}
          </h3>
          <span
            className="mt-0.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: 'rgba(0,240,255,0.08)', color: '#00F0FF' }}
          >
            {t(`ownerBoats.types.${boat.type}`)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Users, value: boat.maxPassengers, label: t('ownerBoats.card.guests') },
            { icon: DoorOpen, value: boat.totalCabins, label: t('ownerBoats.card.rooms') },
            { icon: Layers, value: boat.totalServices, label: t('ownerBoats.card.services') },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-lg py-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <s.icon size={14} style={{ color: '#ecf0ff' }} />
              <span className="mt-1 text-sm font-bold" style={{ color: '#ffffff' }}>
                {s.value}
              </span>
              <span className="text-[10px]" style={{ color: '#ecf0ff' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="cyan" size="sm" className="flex-1 gap-1.5" asChild>
            <Link to={`/owner/boats/${boat.id}/edit`}>
              <Pencil size={13} />
              {t('ownerBoats.card.edit')}
            </Link>
          </Button>
          <Button variant="dark-outline" size="sm" className="gap-1.5" asChild>
            <Link to={`/boats/${boat.id}`}>
              <Eye size={13} />
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={() => onDelete(boat.id)}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
