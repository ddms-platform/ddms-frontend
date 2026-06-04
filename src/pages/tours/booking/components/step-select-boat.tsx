import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Check, X } from 'lucide-react';
import { StatusBadge } from '@/components/badges';
import type { Boat } from '../types';
import { MOCK_BOATS } from '../mock-data';

interface StepSelectBoatProps {
  selectedBoat: Boat | null;
  onSelectBoat: (boat: Boat) => void;
}

export default function StepSelectBoat({
  selectedBoat,
  onSelectBoat,
}: StepSelectBoatProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        {t('booking.boat.title')}
      </h2>
      <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
        {t('booking.boat.subtitle')}
      </p>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)' }}
          >
            <Check size={12} style={{ color: '#34D399' }} />
          </div>
          <span className="text-xs" style={{ color: '#ecf0ff' }}>
            {t('booking.boat.available')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <X size={12} style={{ color: '#EF4444' }} />
          </div>
          <span className="text-xs" style={{ color: '#ecf0ff' }}>
            {t('booking.boat.unavailable')}
          </span>
        </div>
      </div>

      {/* Boat Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MOCK_BOATS.map((boat) => (
          <button
            key={boat.id}
            onClick={() => boat.available && onSelectBoat(boat)}
            disabled={!boat.available}
            className="group relative overflow-hidden rounded-xl border text-left transition-all hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed"
            style={{
              borderColor:
                selectedBoat?.id === boat.id
                  ? '#00F0FF'
                  : boat.available
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.06)',
              backgroundColor:
                selectedBoat?.id === boat.id
                  ? 'rgba(0,240,255,0.06)'
                  : '#0d1b36',
              opacity: boat.available ? 1 : 0.55,
            }}
          >
            {/* Boat Image */}
            <div className="relative h-36 w-full overflow-hidden">
              <img
                src={boat.image}
                alt={boat.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ filter: boat.available ? 'none' : 'grayscale(80%)' }}
              />
              <StatusBadge
                label={
                  boat.available
                    ? t('booking.boat.available')
                    : t('booking.boat.unavailable')
                }
                variant={boat.available ? 'available' : 'unavailable'}
                className="absolute right-2 top-2"
              />
              {selectedBoat?.id === boat.id && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 240, 255, 0.15)' }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#00F0FF' }}
                  >
                    <Check size={20} style={{ color: '#112240' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Boat Info */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: '#ffffff' }}>
                  {boat.name}
                </h3>
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(0,240,255,0.1)',
                    color: '#00F0FF',
                  }}
                >
                  {boat.type === 'cruise'
                    ? t('booking.boat.types.cruise')
                    : boat.type === 'luxury'
                      ? t('booking.boat.types.luxury')
                      : boat.type === 'party'
                        ? t('booking.boat.types.party')
                        : boat.type === 'speedboat'
                          ? t('booking.boat.types.speedboat')
                          : t('booking.boat.types.standard')}
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: '#ecf0ff' }}>
                {boat.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: '#ecf0ff' }}
                >
                  <Users size={13} />
                  <span>
                    {t('booking.boat.capacity')}: {boat.capacity}{' '}
                    {t('booking.guests.people')}
                  </span>
                </div>
                <Link
                  to={`/boats/${boat.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium transition-all hover:underline"
                  style={{ color: '#00F0FF' }}
                >
                  {t('boatDetail.viewDetails')}
                </Link>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
