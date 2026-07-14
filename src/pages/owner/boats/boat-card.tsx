import {
  Ship,
  Users,
  DoorOpen,
  Layers,
  Pencil,
  Eye,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/badges';
import type { BoatListItem } from '@/services/boatService';
import type { IBoatType } from '@/services/system-service';

interface BoatCardProps {
  boat: BoatListItem;
  boatTypes?: IBoatType[];
  onDelete: (id: string) => void;
}

export default function BoatCard({ boat, boatTypes, onDelete }: BoatCardProps) {
  const { t, i18n } = useTranslation();
  const hasActiveMaintenance = boat.status === 'maintenance';
  const complianceStatus =
    boat.complianceStatus ??
    (boat as { compliance_status?: string }).compliance_status;
  const showComplianceBadge = complianceStatus && complianceStatus !== 'valid';

  const complianceVariant =
    complianceStatus === 'locked'
      ? 'error'
      : complianceStatus === 'hidden'
        ? 'ownerPending'
        : 'ownerAttention';

  return (
    <div
      className="group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
      style={{
        backgroundColor: 'var(--ddms-bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'rgba(0,0,0,0.08) 0px 2px 8px',
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {boat.thumbnailUrl ? (
          <img
            src={boat.thumbnailUrl}
            alt={boat.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ddms-secondary/5">
            <Ship size={48} className="text-ddms-secondary/30" />
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
            <StatusBadge
              label={t('ownerBoats.card.maintenance')}
              variant="ownerMaintenance"
            />
          </div>
        )}

        {showComplianceBadge && (
          <div
            className={`absolute ${hasActiveMaintenance ? 'top-12' : 'top-3'} right-3`}
          >
            <StatusBadge
              label={t(`ownerBoats.compliance.${complianceStatus}`)}
              variant={complianceVariant}
              icon={ShieldAlert}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {boat.name}
          </h3>
          {boat.type && (
            <span className="mt-0.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium bg-ddms-secondary/10 text-ddms-secondary">
              {(() => {
                const localizedName = t(`ownerBoats.types.${boat.type}`);
                if (
                  localizedName &&
                  !localizedName.startsWith('ownerBoats.types.')
                ) {
                  return localizedName;
                }
                const foundType = boatTypes?.find(
                  (bt) => bt.code === boat.type,
                );
                return foundType
                  ? i18n.language === 'en'
                    ? foundType.nameEn
                    : foundType.nameVi
                  : boat.type;
              })()}
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            {
              icon: Users,
              value: boat.maxPassengers,
              label: t('ownerBoats.card.guests'),
            },
            {
              icon: DoorOpen,
              value: boat.cabinCount,
              label: t('ownerBoats.card.rooms'),
            },
            {
              icon: Layers,
              value: boat.serviceCount,
              label: t('ownerBoats.card.services'),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-lg py-2 bg-ddms-bg-main border border-border/20"
            >
              <s.icon size={14} className="text-muted-foreground" />
              <span className="mt-1 text-sm font-bold text-foreground">
                {s.value}
              </span>
              <span className="text-[10px] text-muted-foreground">
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-foreground border-foreground/30 hover:bg-foreground/5"
            asChild
          >
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
