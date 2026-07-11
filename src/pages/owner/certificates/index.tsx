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
  ShieldCheck,
  Clock3,
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

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'expired';

const EXPIRY_WARNING_DAYS = 7;

const isExpiringSoon = (cert: OwnerCertificateListItem) => {
  if (cert.status !== 'approved') return false;
  const diffDays = Math.ceil(
    (new Date(cert.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= EXPIRY_WARNING_DAYS;
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

  const stats = useMemo(() => {
    const pending = certificates.filter((c) => c.status === 'pending').length;
    const rejected = certificates.filter((c) => c.status === 'rejected').length;
    const expired = certificates.filter((c) => c.status === 'expired').length;
    const expiringSoon = certificates.filter(isExpiringSoon).length;
    return {
      total: certificates.length,
      pending,
      rejected,
      expired,
      needsAttention: pending + rejected + expired + expiringSoon,
    };
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

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t('ownerCertificates.stats.total'),
            value: stats.total,
            icon: FileText,
            colorClass:
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400',
            iconColor: 'text-cyan-500',
          },
          {
            label: t('ownerCertificates.stats.pending'),
            value: stats.pending,
            icon: Clock3,
            colorClass:
              'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
            iconColor: 'text-amber-500',
          },
          {
            label: t('ownerCertificates.stats.needsAttention'),
            value: stats.needsAttention,
            icon: ShieldAlert,
            colorClass:
              'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
            iconColor: 'text-red-500',
          },
          {
            label: t('ownerCertificates.stats.rejected'),
            value: stats.rejected,
            icon: ShieldCheck,
            colorClass:
              'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400',
            iconColor: 'text-purple-500',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] border ${s.colorClass}`}
          >
            <div className="flex items-center gap-2">
              <s.icon size={16} className={s.iconColor} />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="mt-2 text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

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
                        count: boatCerts.length,
                      })}
                    </p>
                  </div>
                  {attentionCount > 0 && (
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
                    <CertificateTab boatId={boat.id} onChanged={fetchData} />
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
