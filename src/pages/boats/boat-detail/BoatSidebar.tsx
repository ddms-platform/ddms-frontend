import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Waves, Star, DoorOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import type { Boat } from '@/services/boatService';

interface BoatSidebarProps {
  boat: Boat;
}

const BoatSidebar = ({ boat }: BoatSidebarProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div
        className="sticky top-24 space-y-6 rounded-2xl p-6"
        style={{
          backgroundColor: '#112240',
          boxShadow:
            'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#ecf0ff' }}>
            {t('boatDetail.captain')}
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                color: '#0A192F',
              }}
            >
              C
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#ffffff' }}>
                Captain
              </p>
              <p className="text-xs" style={{ color: '#ecf0ff' }}>
                N/A
              </p>
            </div>
          </div>
        </div>

        <div
          className="h-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        />

        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ backgroundColor: 'rgba(52,211,153,0.08)' }}
        >
          <Shield size={20} style={{ color: '#34D399' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#34D399' }}>
              {t('boatDetail.safety')}
            </p>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {t('boatDetail.safetyDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
          >
            <Waves size={18} className="mx-auto" style={{ color: '#00F0FF' }} />
            <p className="mt-1 text-lg font-bold" style={{ color: '#ffffff' }}>
              0
            </p>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {t('boatDetail.totalTrips')}
            </p>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
          >
            <Star
              size={18}
              className="mx-auto"
              fill="#FFD700"
              style={{ color: '#FFD700' }}
            />
            <p className="mt-1 text-lg font-bold" style={{ color: '#ffffff' }}>
              5.0
            </p>
            <p className="text-xs" style={{ color: '#ecf0ff' }}>
              {t('boatDetail.rating')}
            </p>
          </div>
        </div>

        <div
          className="h-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        />

        {boat.status === 'running' ? (
          <div className="space-y-3">
            <Button
              variant="cyan"
              size="action-lg"
              className="w-full gap-2"
              asChild
            >
              <Link to={`/boats/${boat.id}/rooms`}>
                <DoorOpen size={16} />
                {t('boatDetail.viewRooms')}
              </Link>
            </Button>
            <Button
              variant="dark-outline"
              size="action-lg"
              className="w-full gap-2"
              asChild
            >
              <Link to={routeName.tours}>
                {t('boatDetail.bookWithBoat')}
                <ChevronRight size={16} />
              </Link>
            </Button>
          </div>
        ) : (
          <div
            className="rounded-lg py-3.5 text-center text-sm font-medium"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#ecf0ff',
            }}
          >
            {t('boatDetail.currentlyUnavailable')}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoatSidebar;
