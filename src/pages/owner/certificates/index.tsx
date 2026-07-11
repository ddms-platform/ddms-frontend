import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  FileText,
  Ship,
  Search,
  RefreshCw,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/badges';
import { Skeleton } from '@/components/ui/skeleton';
import { boatService, type BoatListItem } from '@/services/boatService';
import {
  certificateService,
  type OwnerCertificateListItem,
} from '@/services/certificateService';
import CertificateTab from '@/pages/owner/boats/boat-form/CertificateTab';
import CertificateStatusChart from './CertificateStatusChart';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'expired';

const EXPIRY_WARNING_DAYS = 30;

const isExpiringSoon = (cert: OwnerCertificateListItem) => {
  if (cert.status !== 'approved') return false;
  const iso = cert.expiryDate?.slice(0, 10);
  if (!iso) return false;
  const diffDays = Math.ceil(
    (new Date(`${iso}T00:00:00`).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );
  return diffDays >= 0 && diffDays <= EXPIRY_WARNING_DAYS;
};

export default function OwnerCertificatesPage() {
  const { t } = useTranslation();
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [certificates, setCertificates] = useState<OwnerCertificateListItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedBoatId, setExpandedBoatId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [boatsRes, certsRes] = await Promise.all([
        boatService.getOwnerBoats({ pageSize: 100 }),
        certificateService.getAllForOwner(),
      ]);
      setBoats(boatsRes.items || []);
      setCertificates(certsRes || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Không thể tải dữ liệu giấy tờ',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const certsByBoat = useMemo(() => {
    const map = new Map<string, OwnerCertificateListItem[]>();
    certificates.forEach((cert) => {
      const list = map.get(cert.boatId) ?? [];
      list.push(cert);
      map.set(cert.boatId, list);
    });
    return map;
  }, [certificates]);

  const filteredBoats = useMemo(
    () =>
      boats.filter((boat) => {
        const matchSearch = boat.name
          .toLowerCase()
          .includes(search.toLowerCase());
        if (!matchSearch) return false;

        if (statusFilter === 'all') return true;

        const boatCerts = certsByBoat.get(boat.id) ?? [];
        if (statusFilter === 'expired') {
          return boatCerts.some(
            (c) => c.status === 'expired' || isExpiringSoon(c),
          );
        }
        return boatCerts.some((c) => c.status === statusFilter);
      }),
    [boats, search, statusFilter, certsByBoat],
  );

  const STATUS_TABS: StatusFilter[] = [
    'all',
    'pending',
    'approved',
    'rejected',
    'expired',
  ];

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ letterSpacing: '-0.44px' }}
          >
            {t('ownerCertificates.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('ownerCertificates.subtitle')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchData}
          title={t('ownerCertificates.refresh')}
        >
          <RefreshCw
            size={16}
            className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {!loading && certificates.length > 0 && (
        <CertificateStatusChart
          certificates={certificates}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          isExpiringSoon={isExpiringSoon}
        />
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="certificate-boat-search"
            placeholder={t('ownerCertificates.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-ddms-bg-main border-border text-foreground"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                statusFilter === s
                  ? 'bg-ddms-secondary/15 text-ddms-secondary border-ddms-secondary/30'
                  : 'bg-ddms-bg-main text-muted-foreground border-border hover:bg-foreground/5'
              }`}
            >
              {t(`ownerCertificates.filter.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBoats.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ddms-secondary/10">
            <FileText size={36} className="text-ddms-secondary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {t('ownerCertificates.empty.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('ownerCertificates.empty.description')}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredBoats.map((boat) => {
            const boatCerts = certsByBoat.get(boat.id) ?? [];
            const visibleCerts =
              statusFilter === 'all'
                ? boatCerts
                : statusFilter === 'expired'
                  ? boatCerts.filter(
                      (c) => c.status === 'expired' || isExpiringSoon(c),
                    )
                  : boatCerts.filter((c) => c.status === statusFilter);
            const attentionCount = boatCerts.filter(
              (c) =>
                c.status === 'pending' ||
                c.status === 'rejected' ||
                c.status === 'expired' ||
                isExpiringSoon(c),
            ).length;
            const isExpanded = expandedBoatId === boat.id;

            return (
              <div
                key={boat.id}
                className="bg-ddms-bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedBoatId(isExpanded ? null : boat.id)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ddms-secondary/10 overflow-hidden">
                    {boat.thumbnailUrl ? (
                      <img
                        src={boat.thumbnailUrl}
                        alt={boat.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Ship size={20} className="text-ddms-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {boat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('ownerCertificates.documentCount', {
                        count: visibleCerts.length,
                      })}
                    </p>
                  </div>
                  {attentionCount > 0 && statusFilter === 'all' && (
                    <StatusBadge
                      label={t('ownerCertificates.attentionCount', {
                        count: attentionCount,
                      })}
                      variant="ownerAttention"
                      icon={ShieldAlert}
                    />
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-muted-foreground transition-transform shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <CertificateTab
                      boatId={boat.id}
                      onChanged={fetchData}
                      statusFilter={statusFilter}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
