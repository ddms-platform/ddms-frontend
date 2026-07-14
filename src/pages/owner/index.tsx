import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ship,
  Map,
  TrendingUp,
  Layers,
  X,
  FileWarning,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/badges';
import {
  boatService,
  type BoatListItem,
  type BoatStatsResponse,
} from '@/services/boatService';
import {
  certificateService,
  type CertificateTypeItem,
  type OwnerCertificateListItem,
} from '@/services/certificateService';
import { useAuth } from '@/hooks/use-auth';
import ProfitChart from '@/components/owner/ProfitChart';
import BoatForm from '@/pages/owner/boats/boat-form';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDisplayDate } from '@/lib/date-format';

const CERT_STATUS_VARIANT: Record<
  string,
  'ownerPending' | 'ownerIdle' | 'error' | 'warning'
> = {
  pending: 'ownerPending',
  approved: 'ownerIdle',
  rejected: 'error',
  expired: 'warning',
};

const EXPIRY_WARNING_DAYS = 7;

export default function OwnerDashboard() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const { user } = useAuth();
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [stats, setStats] = useState<BoatStatsResponse | null>(null);
  const [certificates, setCertificates] = useState<OwnerCertificateListItem[]>(
    [],
  );
  const [certTypes, setCertTypes] = useState<CertificateTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoatIdForModal, setSelectedBoatIdForModal] = useState<
    string | null
  >(null);
  const [modalInitialTab, setModalInitialTab] = useState<
    'basic' | 'certificates'
  >('basic');

  const certTypeLabel = (code: string) => {
    const found = certTypes.find((item) => item.code === code);
    if (found) return isEn ? found.nameEn : found.nameVi;
    return code;
  };

  const refreshDashboardData = async () => {
    try {
      const [statsRes, boatsRes, certsRes, typesRes] = await Promise.all([
        boatService.getOwnerStats(),
        boatService.getOwnerBoats({ pageSize: 8 }),
        certificateService.getAllForOwner().catch(() => []),
        certificateService
          .getTypes('boat')
          .catch(() => [] as CertificateTypeItem[]),
      ]);
      setStats(statsRes);
      setBoats(boatsRes.items || []);
      setCertificates(certsRes || []);
      setCertTypes(typesRes || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const openBoatCertificates = (boatId: string) => {
    setModalInitialTab('certificates');
    setSelectedBoatIdForModal(boatId);
  };

  const attentionCertificates = useMemo(() => {
    const today = new Date();
    return certificates
      .filter((c) => {
        if (
          c.status === 'pending' ||
          c.status === 'rejected' ||
          c.status === 'expired'
        ) {
          return true;
        }
        if (c.status === 'approved') {
          const expiry = new Date(c.expiryDate);
          const diffDays = Math.ceil(
            (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          return diffDays <= EXPIRY_WARNING_DAYS;
        }
        return false;
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
      );
  }, [certificates]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await refreshDashboardData();
      setLoading(false);
    };
    initData();
  }, []);

  const STATS_CARDS = [
    {
      label: t('ownerBoats.stats.total'),
      value: stats?.total || 0,
      icon: Ship,
      color: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: t('ownerBoats.stats.running'),
      value: stats?.running || 0,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('ownerBoats.stats.idle'),
      value: stats?.idle || 0,
      icon: Layers,
      color: 'text-amber-600 dark:text-yellow-400',
    },
    {
      label: 'Tổng số Cabin',
      value: stats?.totalCabins || 0,
      icon: Map,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-ddms-bg-owner p-6 lg:p-8 font-sans text-foreground">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Xin chào, {user?.name || 'Admiral'}
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Map className="w-4 h-4 mr-2 text-cyan-500" />
            <span>Bến tàu quốc tế Marina Bay</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-ddms-bg-card border border-border shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          {/* Main content header skeleton */}
          <div className="flex items-center justify-between mt-8">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Boat list skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5 space-y-4"
              >
                <Skeleton className="h-40 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="pt-2 flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {STATS_CARDS.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-ddms-bg-card border border-border shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </p>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className={`text-3xl font-bold ${s.color}`}>{s.value}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold border-l-4 border-cyan-500 pl-3">
                Đội tàu của bạn
              </h3>
              <Link
                to="/owner/boats"
                className="text-sm text-cyan-500 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            {boats.length === 0 ? (
              <div className="bg-ddms-bg-card rounded-2xl border border-border p-10 text-center shadow-lg">
                <Ship className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground">
                  Bạn chưa có tàu nào
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Hãy đăng ký tàu mới để bắt đầu quản lý
                </p>
                <Button
                  className="mt-4 bg-cyan-500 text-slate-900 hover:bg-cyan-400"
                  asChild
                >
                  <Link to="/owner/boats/new">Thêm tàu mới</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {boats.map((boat) => (
                  <div
                    key={boat.id}
                    className="bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-lg group"
                  >
                    <div className="h-40 bg-muted relative overflow-hidden flex items-center justify-center">
                      {boat.thumbnailUrl ? (
                        <img
                          src={boat.thumbnailUrl}
                          alt={boat.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Ship className="w-12 h-12 text-muted-foreground/60" />
                      )}
                      {boat.status === 'running' ? (
                        <Badge className="absolute top-3 right-3 bg-emerald-500/90 hover:bg-emerald-500 text-white border-none shadow-sm">
                          HOẠT ĐỘNG
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="absolute top-3 right-3 border-yellow-500 text-yellow-500 bg-yellow-500/10 backdrop-blur-sm shadow-sm"
                        >
                          ĐANG CHỜ
                        </Badge>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-2">
                        <h4 className="text-lg font-bold text-foreground line-clamp-1">
                          {boat.name}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {boat.type
                            ? t(`boatTypes.${boat.type.toLowerCase()}`, {
                                defaultValue: boat.type,
                              })
                            : t('boatTypes.unclassified', {
                                defaultValue: 'Chưa phân loại',
                              })}
                        </p>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-muted-foreground/60" />
                          <span>{boat.cabinCount} Cabins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground/60" />
                          <span>{boat.serviceCount} Dịch vụ</span>
                        </div>
                      </div>
                      <div className="mt-5 flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full text-foreground border-foreground/30 hover:bg-foreground/5 cursor-pointer"
                          onClick={() => setSelectedBoatIdForModal(boat.id)}
                        >
                          CHI TIẾT
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legal Document Management Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold border-l-4 border-cyan-500 pl-3 flex items-center gap-2">
                  Quản lý giấy tờ pháp lý
                  {attentionCertificates.length > 0 && (
                    <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white border-none">
                      {attentionCertificates.length}
                    </Badge>
                  )}
                </h3>
                <Link
                  to="/owner/certificates"
                  className="text-sm text-cyan-500 hover:underline"
                >
                  Xem tất cả giấy tờ
                </Link>
              </div>

              <div className="bg-ddms-bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                {attentionCertificates.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-base font-medium text-foreground">
                      Mọi giấy tờ đều hợp lệ
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Không có giấy tờ nào cần xử lý hoặc sắp hết hạn.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {attentionCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <FileWarning
                            size={20}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {certTypeLabel(cert.certificateType)}
                              <span className="text-muted-foreground font-normal">
                                {' '}
                                · {cert.boatName}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t('ownerBoats.certificates.expiresOn', {
                                date: formatDisplayDate(cert.expiryDate),
                              })}
                            </p>
                            {cert.rejectionReason && (
                              <p className="text-xs text-red-400 mt-1">
                                {t('ownerBoats.certificates.rejectionReason', {
                                  reason: cert.rejectionReason,
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge
                            label={t(
                              `ownerBoats.certificates.status.${cert.status}`,
                              cert.status,
                            )}
                            variant={
                              CERT_STATUS_VARIANT[cert.status] ?? 'ownerPending'
                            }
                          />
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title={t('ownerBoats.certificates.viewDocument')}
                          >
                            <ExternalLink size={16} />
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-foreground border-foreground/30 hover:bg-foreground/5"
                            onClick={() => openBoatCertificates(cert.boatId)}
                          >
                            <FileText size={13} />
                            Quản lý
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profit Chart Section */}
            <div className="mt-8">
              <ProfitChart data={stats?.monthlyProfits || []} />
            </div>
          </div>
        </>
      )}
      {/* Boat Detail Modal */}
      {selectedBoatIdForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedBoatIdForModal(null)}
          />
          <div className="relative z-10 w-full max-w-5xl bg-ddms-bg-owner border border-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => {
                  setSelectedBoatIdForModal(null);
                  setModalInitialTab('basic');
                }}
                className="p-1.5 bg-muted hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-full border border-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <BoatForm
                boatIdProp={selectedBoatIdForModal}
                initialTab={modalInitialTab}
                onClose={() => {
                  setSelectedBoatIdForModal(null);
                  setModalInitialTab('basic');
                }}
                onSaved={async () => {
                  setSelectedBoatIdForModal(null);
                  setModalInitialTab('basic');
                  await refreshDashboardData();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
