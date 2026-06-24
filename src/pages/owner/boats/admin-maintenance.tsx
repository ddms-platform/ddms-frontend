import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Loader2,
  Check,
  X,
  ShieldAlert,
  Calendar,
  Ship,
  Wrench,
  Clock,
  FileText,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { boatService } from '@/services/boatService';
import type { PendingMaintenance } from '@/interfaces/maintenance';

export default function AdminMaintenancePage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<PendingMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await boatService.getPendingMaintenancesAdmin();
      setRequests(res || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phê duyệt', error);
      toast.error(t('adminMaintenance.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await boatService.approveMaintenanceAdmin(id);
      toast.success(t('adminMaintenance.toast.approveSuccess'));
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error(t('adminMaintenance.toast.approveError'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await boatService.rejectMaintenanceAdmin(id);
      toast.success(t('adminMaintenance.toast.rejectSuccess'));
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error(t('adminMaintenance.toast.rejectError'));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.boatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.portMaintenanceServiceName || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="px-4 py-6 lg:px-8 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-6 rounded-2xl border border-slate-800/40 backdrop-blur-sm">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
              <ShieldAlert size={24} />
            </div>
            {t('adminMaintenance.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {t('adminMaintenance.subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900/10 p-4 rounded-2xl border border-slate-800/40">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder={t('adminMaintenance.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-xs text-slate-400 font-medium self-center px-2">
              {t('adminMaintenance.showCount', {
                count: filteredRequests.length,
                total: requests.length,
              })}
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl py-24 text-center bg-slate-900/10 border border-slate-800/30">
              <Calendar
                size={48}
                className="text-slate-700 mb-4 animate-pulse"
              />
              <p className="text-sm text-slate-400 font-medium">
                {searchQuery
                  ? t('adminMaintenance.emptyFiltered')
                  : t('adminMaintenance.empty')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredRequests.map((req) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      transition: { duration: 0.15 },
                    }}
                    key={req.id}
                    className="relative bg-slate-900/30 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-5 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.04)] transition-all duration-300 flex flex-col lg:flex-row justify-between gap-6"
                  >
                    <div className="flex-1 space-y-4">
                      {/* Top Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/40 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
                            <Ship size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base leading-snug">
                              {req.boatName}
                            </h3>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ID: {req.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 text-xs font-semibold">
                          <Wrench size={12} />
                          {req.portMaintenanceServiceName}
                        </div>
                      </div>

                      {/* Detail Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Calendar
                            size={16}
                            className="text-slate-500 shrink-0"
                          />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                              {t('adminMaintenance.scheduledDate')}
                            </p>
                            <p className="font-medium text-slate-300">
                              {new Date(req.startTime).toLocaleDateString(
                                'vi-VN',
                              )}{' '}
                              {new Date(req.startTime).toLocaleTimeString(
                                'vi-VN',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                          <Clock
                            size={16}
                            className="text-slate-500 shrink-0"
                          />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-sans">
                              {t('adminMaintenance.estimatedEndTime')}
                            </p>
                            <p className="font-medium text-slate-300">
                              {new Date(req.endTime).toLocaleDateString(
                                'vi-VN',
                              )}{' '}
                              {new Date(req.endTime).toLocaleTimeString(
                                'vi-VN',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {req.reason && (
                        <div className="p-3.5 bg-slate-950/30 border border-slate-800/40 rounded-xl flex items-start gap-2.5">
                          <FileText
                            size={16}
                            className="text-slate-500 shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                              {t('adminMaintenance.reason')}
                            </p>
                            <p className="text-xs text-slate-300 italic mt-0.5 leading-relaxed">
                              "{req.reason}"
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                        <Clock size={10} />
                        <span>
                          {t('adminMaintenance.requestTime', {
                            time: new Date(req.createdAt).toLocaleString(
                              'vi-VN',
                            ),
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-row lg:flex-col justify-end items-stretch gap-3 shrink-0 self-stretch lg:self-center w-full lg:w-44 border-t lg:border-t-0 border-slate-800/40 pt-4 lg:pt-0">
                      <Button
                        size="default"
                        variant="ghost"
                        className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500/30 transition-all font-semibold rounded-xl"
                        disabled={processingId !== null}
                        onClick={() => handleReject(req.id)}
                      >
                        {processingId === req.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <X size={16} className="mr-1.5 shrink-0" />
                        )}
                        {t('adminMaintenance.reject')}
                      </Button>
                      <Button
                        size="default"
                        variant="ghost"
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500/30 transition-all font-semibold rounded-xl"
                        disabled={processingId !== null}
                        onClick={() => handleApprove(req.id)}
                      >
                        {processingId === req.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} className="mr-1.5 shrink-0" />
                        )}
                        {t('adminMaintenance.approve')}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
