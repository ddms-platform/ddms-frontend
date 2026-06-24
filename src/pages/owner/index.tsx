import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ship, Map, TrendingUp, Layers, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  boatService,
  type BoatListItem,
  type BoatStatsResponse,
} from '@/services/boatService';
import { useAuth } from '@/hooks/use-auth';
import ProfitChart from '@/components/owner/ProfitChart';
import BoatForm from '@/pages/owner/boats/boat-form';

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [stats, setStats] = useState<BoatStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBoatIdForModal, setSelectedBoatIdForModal] = useState<
    string | null
  >(null);

  const refreshDashboardData = async () => {
    try {
      const [statsRes, boatsRes] = await Promise.all([
        boatService.getOwnerStats(),
        boatService.getOwnerBoats({ pageSize: 8 }),
      ]);
      setStats(statsRes);
      setBoats(boatsRes.items || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

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
      color: 'text-cyan-400',
    },
    {
      label: t('ownerBoats.stats.running'),
      value: stats?.running || 0,
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: t('ownerBoats.stats.idle'),
      value: stats?.idle || 0,
      icon: Layers,
      color: 'text-yellow-400',
    },
    {
      label: 'Tổng số Cabin',
      value: stats?.totalCabins || 0,
      icon: Map,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] p-6 lg:p-8 font-sans text-slate-100">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Xin chào, {user?.name || 'Admiral'}
          </h1>
          <div className="flex items-center text-sm text-slate-400">
            <Map className="w-4 h-4 mr-2 text-cyan-500" />
            <span>Bến tàu quốc tế Marina Bay</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {STATS_CARDS.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#111C3A] border border-slate-800/60 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
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
              <div className="bg-[#111C3A] rounded-2xl border border-slate-800/60 p-10 text-center shadow-lg">
                <Ship className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate-300">
                  Bạn chưa có tàu nào
                </h4>
                <p className="text-sm text-slate-500 mt-2">
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
                    className="bg-[#111C3A] rounded-2xl border border-slate-800/60 overflow-hidden shadow-lg group"
                  >
                    <div className="h-40 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                      {boat.thumbnailUrl ? (
                        <img
                          src={boat.thumbnailUrl}
                          alt={boat.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Ship className="w-12 h-12 text-slate-600" />
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
                        <h4 className="text-lg font-bold text-white line-clamp-1">
                          {boat.name}
                        </h4>
                        <p className="text-xs text-slate-400 capitalize">
                          {boat.type
                            ? t(`boatTypes.${boat.type.toLowerCase()}`, {
                                defaultValue: boat.type,
                              })
                            : t('boatTypes.unclassified', {
                                defaultValue: 'Chưa phân loại',
                              })}
                        </p>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-slate-500" />
                          <span>{boat.cabinCount} Cabins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-500" />
                          <span>{boat.serviceCount} Dịch vụ</span>
                        </div>
                      </div>
                      <div className="mt-5 flex gap-2">
                        <Button
                          variant="secondary"
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white border-none cursor-pointer"
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
          <div
            className="relative z-10 w-full max-w-5xl bg-[#0b132b] border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => setSelectedBoatIdForModal(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <BoatForm
                boatIdProp={selectedBoatIdForModal}
                onClose={() => setSelectedBoatIdForModal(null)}
                onSaved={async () => {
                  setSelectedBoatIdForModal(null);
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
