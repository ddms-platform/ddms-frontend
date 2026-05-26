import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ship,
  Plus,
  Search,
  Users,
  Layers,
  DoorOpen,
  Wrench,
  TrendingUp,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/badges';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BOAT_TYPES, type BoatStatus } from '@/data/owner-boats';
import { formatPrice } from '@/lib/utils';
import { boatService, type Boat } from '@/services/boatService';

type FilterStatus = 'all' | BoatStatus;
type ViewMode = 'grid' | 'table';

export default function OwnerBoatList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch boats from API
  const fetchBoats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await boatService.getAll({ pageSize: 100 });
      setBoats(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách tàu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  const filteredBoats = useMemo(
    () =>
      boats.filter((boat) => {
        const matchSearch = boat.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || boat.status === filterStatus;
        const matchType = filterType === 'all' || boat.type === filterType;
        return matchSearch && matchStatus && matchType;
      }),
    [boats, search, filterStatus, filterType]
  );

  const stats = useMemo(
    () => ({
      total: boats.length,
      running: boats.filter((b) => b.status === 'running').length,
      idle: boats.filter((b) => b.status === 'idle').length,
    }),
    [boats]
  );

  const handleDelete = async (boatId: string) => {
    try {
      await boatService.delete(boatId);
      setBoats((prev) => prev.filter((b) => b.id !== boatId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa tàu thất bại');
    }
    setOpenMenuId(null);
  };

  const getTypeLabel = (type: string) => t(`ownerBoats.types.${type}`, type);
  const isFiltered = search || filterStatus !== 'all' || filterType !== 'all';

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: '#00F0FF', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#ecf0ff' }}>
            Đang tải danh sách tàu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
        >
          <Ship size={28} style={{ color: '#EF4444' }} />
        </div>
        <p className="text-sm" style={{ color: '#EF4444' }}>
          {error}
        </p>
        <Button variant="cyan" size="sm" className="gap-2" onClick={fetchBoats}>
          <RefreshCw size={14} /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff', letterSpacing: '-0.44px' }}>
            {t('ownerBoats.title')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
            {t('ownerBoats.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchBoats} title="Làm mới">
            <RefreshCw size={16} style={{ color: '#ecf0ff' }} />
          </Button>
          <Button variant="cyan" size="action" className="gap-2" asChild>
            <Link to="/owner/boats/new">
              <Plus size={16} />
              {t('ownerBoats.addBoat')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          {
            label: t('ownerBoats.stats.total'),
            value: stats.total,
            icon: Ship,
            gradient: 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,240,255,0.04))',
            iconColor: '#00F0FF',
          },
          {
            label: t('ownerBoats.stats.running'),
            value: stats.running,
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
            iconColor: '#10B981',
          },
          {
            label: t('ownerBoats.stats.idle'),
            value: stats.idle,
            icon: Layers,
            gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
            iconColor: '#F59E0B',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{ background: s.gradient, border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-2">
              <s.icon size={16} style={{ color: s.iconColor }} />
              <span className="text-xs font-medium" style={{ color: '#ecf0ff' }}>
                {s.label}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold" style={{ color: '#ffffff' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              style={{ color: '#ecf0ff' }}
            />
            <Input
              id="boat-search"
              placeholder={t('ownerBoats.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
              }}
            />
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <Filter size={14} style={{ color: '#ecf0ff' }} />
            {(['all', 'running', 'idle'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor:
                    filterStatus === s ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filterStatus === s ? '#00F0FF' : '#ecf0ff',
                  border: `1px solid ${filterStatus === s ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
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
            className="rounded-xl px-3 py-2 text-xs font-medium outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ecf0ff',
            }}
          >
            <option value="all">{t('ownerBoats.filter.allTypes')}</option>
            {BOAT_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value}>
                {t(`ownerBoats.types.${bt.value}`)}
              </option>
            ))}
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
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: viewMode === m ? 'rgba(0,240,255,0.12)' : 'transparent',
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
      {filteredBoats.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,240,255,0.08)' }}
          >
            <Ship size={36} style={{ color: '#00F0FF' }} />
          </div>
          <h3 className="mt-4 text-lg font-semibold" style={{ color: '#ffffff' }}>
            {t('ownerBoats.empty.title')}
          </h3>
          <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
            {isFiltered ? t('ownerBoats.empty.filtered') : t('ownerBoats.empty.noBoats')}
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
              t={t}
              getTypeLabel={getTypeLabel}
              onDelete={handleDelete}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />
          ))}
        </div>
      ) : (
        <BoatTable
          boats={filteredBoats}
          t={t}
          getTypeLabel={getTypeLabel}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/* ── Grid Card ── */
function BoatCard({
  boat,
  t,
  getTypeLabel,
  onDelete,
  openMenuId,
  setOpenMenuId,
}: {
  boat: Boat;
  t: (k: string, o?: Record<string, string>) => string;
  getTypeLabel: (t: string) => string;
  onDelete: (id: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}) {
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
          <div className="absolute top-3 right-12">
            <StatusBadge label={t('ownerBoats.card.maintenance')} variant="ownerMaintenance" />
          </div>
        )}
        <div className="absolute right-3 bottom-3 relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpenMenuId(openMenuId === boat.id ? null : boat.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
            }}
          >
            <MoreVertical size={16} />
          </button>
          {openMenuId === boat.id && (
            <div
              className="absolute right-0 bottom-10 z-10 min-w-40 overflow-hidden rounded-xl py-1 shadow-xl"
              style={{ backgroundColor: '#1a2d4d', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Link
                to={`/owner/boats/${boat.id}/edit`}
                onClick={() => setOpenMenuId(null)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5"
                style={{ color: '#ecf0ff' }}
              >
                <Pencil size={14} /> {t('ownerBoats.card.edit')}
              </Link>
              <Link
                to={`/boats/${boat.id}`}
                onClick={() => setOpenMenuId(null)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5"
                style={{ color: '#ecf0ff' }}
              >
                <Eye size={14} /> {t('ownerBoats.card.viewPublic')}
              </Link>
              <div className="my-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <DeleteDialog
                name={boat.name}
                t={t}
                onConfirm={() => {
                  onDelete(boat.id);
                  setOpenMenuId(null);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>
              {boat.name}
            </h3>
            <span
              className="mt-0.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: 'rgba(0,240,255,0.08)', color: '#00F0FF' }}
            >
              {getTypeLabel(boat.type ?? '')}
            </span>
          </div>
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
        </div>
      </div>
    </div>
  );
}

/* ── Table View ── */
function BoatTable({
  boats,
  t,
  getTypeLabel,
  onDelete,
}: {
  boats: Boat[];
  t: (k: string, o?: Record<string, string>) => string;
  getTypeLabel: (t: string) => string;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-200">
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
              className="border-b transition-colors hover:bg-white/2"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 overflow-hidden rounded-lg">
                    {boat.images[0] ? (
                      <img
                        src={boat.images[0].imageUrl}
                        alt={boat.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(0,240,255,0.06)' }}
                      >
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
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: 'rgba(0,240,255,0.08)', color: '#00F0FF' }}
                >
                  {getTypeLabel(boat.type ?? '')}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={t(`ownerBoats.status.${boat.status}`)}
                  variant={boat.status === 'running' ? 'ownerRunning' : 'ownerIdle'}
                />
              </td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: '#ffffff' }}>
                {boat.maxPassengers}
              </td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: '#ffffff' }}>
                {boat.totalCabins}
              </td>
              <td className="px-4 py-3 text-center text-sm" style={{ color: '#ffffff' }}>
                {boat.totalServices}
              </td>
              <td className="px-4 py-3 text-right">
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
                  <DeleteDialog name={boat.name} t={t} onConfirm={() => onDelete(boat.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Shared Delete Dialog ── */
function DeleteDialog({
  name,
  t,
  onConfirm,
}: {
  name: string;
  t: (k: string, o?: Record<string, string>) => string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5"
          style={{ color: '#EF4444' }}
        >
          <Trash2 size={14} /> {t('ownerBoats.card.delete')}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10">
            <Trash2 className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{t('ownerBoats.delete.title', { name })}</AlertDialogTitle>
          <AlertDialogDescription>{t('ownerBoats.delete.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('ownerBoats.delete.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t('ownerBoats.delete.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
