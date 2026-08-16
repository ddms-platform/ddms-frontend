import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ship,
  Plus,
  Search,
  TrendingUp,
  Layers,
  RefreshCw,
  Filter,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type BoatStatus } from '@/data/owner-boats';
import { boatService, type BoatListItem } from '@/services/boatService';
import {
  ownerDocumentService,
  type OwnerDocumentsOverviewResponse,
} from '@/services/ownerDocumentService';
import { getBoatTypes, type IBoatType } from '@/services/system-service';
import BoatCard from './boat-card';
import BoatTable from './boat-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

type FilterStatus = 'all' | BoatStatus;
type ViewMode = 'grid' | 'table';

export default function OwnerBoatList() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [boatTypes, setBoatTypes] = useState<IBoatType[]>([]);
  const [docOverview, setDocOverview] =
    useState<OwnerDocumentsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoats = useCallback(async () => {
    setLoading(true);
    try {
      const [res, overview] = await Promise.all([
        boatService.getOwnerBoats({ pageSize: 100 }),
        ownerDocumentService.getOverview().catch(() => null),
      ]);
      setBoats(res.items || []);
      setDocOverview(overview);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Không thể tải danh sách tàu',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    getBoatTypes()
      .then((res) => {
        if (res.data) {
          setBoatTypes(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load boat types:', err);
      });
  }, []);

  const isLocked = Boolean(docOverview?.isLocked);

  // Vai tro `owner` chi duoc cap khi cang vu duyet ho so, nhung thuyen da duoc
  // tao ngay tu luc nop. Trong khoang cho duyet phai noi ro dieu do, khong thi
  // chu thuyen tuong thuyen bi mat va di khai lai mot chiec nua.
  const { user } = useAuth();
  const hoSoChoDuyet =
    user?.hasOwnerProfile === true && user?.ownerProfileStatus === 'pending';

  const filteredBoats = useMemo(
    () =>
      boats.filter((b) => {
        const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || b.status === filterStatus;
        const matchType = filterType === 'all' || b.type === filterType;
        return matchSearch && matchStatus && matchType;
      }),
    [boats, search, filterStatus, filterType],
  );

  const stats = useMemo(
    () => ({
      total: boats.length,
      running: boats.filter((b) => b.status === 'running').length,
      idle: boats.filter((b) => b.status === 'idle').length,
    }),
    [boats],
  );

  const handleDelete = async (boatId: string) => {
    try {
      await boatService.deleteByOwner(boatId);
      setBoats((prev) => prev.filter((b) => b.id !== boatId));
      toast.success('Đã xóa tàu thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa tàu thất bại');
    }
  };

  const isFiltered = search || filterStatus !== 'all' || filterType !== 'all';

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      {hoSoChoDuyet && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-amber-500/20 p-2.5 text-amber-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Hồ sơ chủ thuyền đang chờ cảng vụ duyệt
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Thuyền bạn đã khai lúc đăng ký nằm ngay bên dưới — không cần
                khai lại. Sau khi hồ sơ được duyệt, bạn mới thêm và sửa được
                thuyền.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue / Compliance Banner */}
      {isLocked && (
        <div
          className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
            docOverview?.isPendingReview
              ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                docOverview?.isPendingReview
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                {docOverview?.isPendingReview
                  ? 'Hồ sơ pháp lý đang chờ Ban quản trị phê duyệt'
                  : 'Chức năng quản lý và đăng ký tàu mới đang bị tạm khóa'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {docOverview?.isPendingReview
                  ? 'Bạn đã nộp đầy đủ giấy tờ. Hệ thống sẽ tự động mở khóa quản lý tàu ngay sau khi được Admin phê duyệt.'
                  : 'Hồ sơ pháp lý của bạn chưa hoàn tất và đã quá thời hạn nộp. Vui lòng tải lên giấy tờ để gửi Admin xét duyệt và mở khóa.'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={docOverview?.isPendingReview ? 'default' : 'destructive'}
            className="cursor-pointer shrink-0 rounded-xl font-bold"
            asChild
          >
            <Link to="/owner/documents">Xem hồ sơ giấy tờ &rarr;</Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ letterSpacing: '-0.44px' }}
          >
            {t('ownerBoats.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('ownerBoats.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchBoats}
            title="Làm mới"
          >
            <RefreshCw
              size={16}
              className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
          {hoSoChoDuyet ? null : isLocked ? (
            <Button
              variant="destructive"
              size="action"
              className="gap-2 opacity-80 cursor-not-allowed"
              disabled
            >
              <Lock size={16} />
              Tạm khóa thêm tàu
            </Button>
          ) : (
            <Button variant="cyan" size="action" className="gap-2" asChild>
              <Link to="/owner/boats/new">
                <Plus size={16} />
                {t('ownerBoats.addBoat')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          {
            label: t('ownerBoats.stats.total'),
            value: stats.total,
            icon: Ship,
            colorClass:
              'bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400',
            iconColor: 'text-cyan-500',
          },
          {
            label: t('ownerBoats.stats.running'),
            value: stats.running,
            icon: TrendingUp,
            colorClass:
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
            iconColor: 'text-emerald-500',
          },
          {
            label: t('ownerBoats.stats.idle'),
            value: stats.idle,
            icon: Layers,
            colorClass:
              'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
            iconColor: 'text-amber-500',
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
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="boat-search"
              placeholder={t('ownerBoats.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-ddms-bg-main border-border text-foreground"
            />
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <Filter size={13} className="text-muted-foreground" />
            {(['all', 'running', 'idle'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                  filterStatus === s
                    ? 'bg-ddms-secondary/15 text-ddms-secondary border-ddms-secondary/30'
                    : 'bg-ddms-bg-main text-muted-foreground border-border hover:bg-foreground/5'
                }`}
              >
                {t(`ownerBoats.filter.${s}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            id="boat-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs font-medium outline-none bg-ddms-bg-main border border-border text-foreground"
          >
            <option value="all" className="bg-ddms-bg-card text-foreground">
              {t('ownerBoats.filter.allTypes')}
            </option>
            {boatTypes.map((bt) => {
              const localizedName = t(`ownerBoats.types.${bt.code}`);
              const displayName =
                localizedName && !localizedName.startsWith('ownerBoats.types.')
                  ? localizedName
                  : i18n.language === 'en'
                    ? bt.nameEn
                    : bt.nameVi;
              return (
                <option
                  key={bt.code}
                  value={bt.code}
                  className="bg-ddms-bg-card text-foreground"
                >
                  {displayName}
                </option>
              );
            })}
          </select>
          <div
            className="flex rounded-xl p-0.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {(['grid', 'table'] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    viewMode === m ? 'rgba(0,240,255,0.12)' : 'transparent',
                  color: viewMode === m ? '#00F0FF' : '#ecf0ff',
                }}
              >
                {t(`ownerBoats.view.${m}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-5 space-y-4"
              >
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-sm p-6 space-y-4">
            <div className="flex gap-4 border-b border-border pb-3">
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6 ml-auto" />
            </div>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 py-2 items-center">
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-8 w-16 ml-auto" />
              </div>
            ))}
          </div>
        )
      ) : filteredBoats.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ddms-secondary/10">
            <Ship size={36} className="text-ddms-secondary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {t('ownerBoats.empty.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFiltered
              ? t('ownerBoats.empty.filtered')
              : t('ownerBoats.empty.noBoats')}
          </p>
          {!isFiltered && (
            <Button variant="cyan" size="action" className="mt-6 gap-2" asChild>
              <Link to="/owner/boats/new">
                <Plus size={16} />
                {t('ownerBoats.addBoat')}
              </Link>
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBoats.map((boat) => (
            <BoatCard
              key={boat.id}
              boat={boat}
              boatTypes={boatTypes}
              isLocked={isLocked}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <BoatTable
          boats={filteredBoats}
          boatTypes={boatTypes}
          isLocked={isLocked}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
