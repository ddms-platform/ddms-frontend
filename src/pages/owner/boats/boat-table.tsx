import { Ship, Pencil, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/badges';
import type { Boat } from '@/services/boatService';

interface BoatTableProps {
  boats: Boat[];
  onDelete: (id: string) => void;
}

export default function BoatTable({ boats, onDelete }: BoatTableProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl" style={{ backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.04)' }}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr
            className="border-b text-left text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#ecf0ff' }}
          >
            <th className="px-4 py-3">{t('ownerBoats.table.boat')}</th>
            <th className="px-4 py-3">{t('ownerBoats.table.type')}</th>
            <th className="px-4 py-3">{t('ownerBoats.table.status')}</th>
            <th className="px-4 py-3 text-center">{t('ownerBoats.table.capacity')}</th>
            <th className="px-4 py-3 text-center">{t('ownerBoats.table.rooms')}</th>
            <th className="px-4 py-3 text-center">{t('ownerBoats.table.services')}</th>
            <th className="px-4 py-3 text-right">{t('ownerBoats.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {boats.map((boat) => (
            <tr
              key={boat.id}
              className="border-b transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 overflow-hidden rounded-lg">
                    {boat.images[0] ? (
                      <img src={boat.images[0].imageUrl} alt={boat.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(0,240,255,0.06)' }}>
                        <Ship size={16} style={{ color: '#00F0FF' }} />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                    {boat.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(0,240,255,0.08)', color: '#00F0FF' }}>
                  {t(`ownerBoats.types.${boat.type}`)}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={t(`ownerBoats.status.${boat.status}`)}
                  variant={boat.status === 'running' ? 'ownerRunning' : 'ownerIdle'}
                />
              </td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: '#ffffff' }}>{boat.maxPassengers}</td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: '#ffffff' }}>{boat.totalCabins}</td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: '#ffffff' }}>{boat.totalServices}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link to={`/owner/boats/${boat.id}/edit`}>
                      <Pencil size={14} style={{ color: '#ecf0ff' }} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link to={`/boats/${boat.id}`}>
                      <Eye size={14} style={{ color: '#ecf0ff' }} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onDelete(boat.id)}>
                    <Trash2 size={14} style={{ color: '#EF4444' }} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
