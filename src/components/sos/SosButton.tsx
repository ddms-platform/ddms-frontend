import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Radio,
  CheckCircle,
  ShieldAlert,
  Navigation,
  WifiOff,
  RefreshCw,
  PhoneCall,
  MessageSquareWarning,
  RadioTower,
} from 'lucide-react';
import {
  sosService,
  sosOfflineQueue,
  sosSyncManager,
} from '@/services/sosService';
import type { SosButtonProps, SosAlert, QueuedSosItem } from '@/interfaces/sos';

export const SosButton: React.FC<SosButtonProps> = ({
  boatId,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SosAlert | null>(null);
  const [offlineItem, setOfflineItem] = useState<QueuedSosItem | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetryingSync, setIsRetryingSync] = useState(false);

  // Initialize Sync Manager & Subscribe to Offline Queue
  useEffect(() => {
    sosSyncManager.init();

    const unsubQueue = sosOfflineQueue.subscribe((queue) => {
      const count = queue.filter(
        (i) => i.status === 'QUEUED' || i.status === 'FAILED',
      ).length;
      setPendingCount(count);
      const latest = queue.find(
        (i) => i.status === 'QUEUED' || i.status === 'FAILED',
      );
      setOfflineItem(latest || null);
    });

    const unsubSync = sosSyncManager.onSyncSuccess((syncedAlert) => {
      setActiveAlert(syncedAlert);
      setOfflineItem(null);
      setLoading(false);
      setIsRetryingSync(false);
    });

    return () => {
      unsubQueue();
      unsubSync();
    };
  }, []);

  const handleTriggerSos = () => {
    setErrorMsg(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setErrorMsg('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const alertData = await sosService.triggerSos({
            boat_id: boatId,
            latitude: lat,
            longitude: lng,
            note: 'Sự cố khẩn cấp trên biển - Thuyền trưởng yêu cầu cứu hộ gấp!',
          });

          setActiveAlert(alertData);
          setOfflineItem(null);
          setLoading(false);
        } catch (err: any) {
          if (err.message === 'OFFLINE_SAVED') {
            const latest = sosOfflineQueue.getLatestPending();
            setOfflineItem(latest);
            setLoading(false);
          } else {
            console.error('Failed to send SOS:', err);
            setErrorMsg(
              err.response?.data?.message ||
                'Không thể phát tín hiệu SOS. Vui lòng kiểm tra kết nối mạng!',
            );
            setLoading(false);
          }
        }
      },
      (geoError) => {
        console.warn('Geolocation error:', geoError);
        // Fallback default coordinates (Da Nang Port / Han River) if GPS permission denied
        triggerSosWithFallback(16.068, 108.225);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const triggerSosWithFallback = async (lat: number, lng: number) => {
    try {
      const alertData = await sosService.triggerSos({
        boat_id: boatId,
        latitude: lat,
        longitude: lng,
        note: 'Tín hiệu SOS khẩn cấp (GPS định vị tại khu vực Bến Sông Hàn)',
      });

      setActiveAlert(alertData);
      setOfflineItem(null);
    } catch (err: any) {
      if (err.message === 'OFFLINE_SAVED') {
        const latest = sosOfflineQueue.getLatestPending();
        setOfflineItem(latest);
      } else {
        setErrorMsg(
          'Lỗi gửi tín hiệu SOS. Vui lòng gọi trực tiếp hotline Cảng vụ!',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualRetry = async () => {
    setIsRetryingSync(true);
    setErrorMsg(null);
    try {
      await sosSyncManager.processQueue();
    } catch (err) {
      console.warn('Manual sync retry failed:', err);
    } finally {
      setIsRetryingSync(false);
    }
  };

  const currentLat =
    activeAlert?.latitude ?? offlineItem?.payload.latitude ?? 16.068;
  const currentLng =
    activeAlert?.longitude ?? offlineItem?.payload.longitude ?? 108.225;

  const smsBody = encodeURIComponent(
    `SOS KHAN CAP! Yeu cau cuu ho tau gap nan. Toa do GPS: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}. Thuyen truong can ung cuu ngay!`,
  );
  const smsHref = `sms:111?body=${smsBody}`;
  const phoneHref = 'tel:111';

  return (
    <>
      {/* ── Main SOS Trigger Button ── */}
      <div className={`relative inline-block ${className}`}>
        <div className="absolute -inset-1.5 rounded-full bg-red-600 blur-md opacity-85 animate-ping" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative flex items-center gap-2.5 bg-linear-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-red-400/40 cursor-pointer text-sm tracking-wide uppercase"
        >
          <Radio className="w-5 h-5 animate-pulse text-yellow-300" />
          <span>{t('sos.button.triggerSos')}</span>

          {/* Pending Offline Sync Badge */}
          {pendingCount > 0 && (
            <span className="ml-1 px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[11px] rounded-full border border-amber-300 animate-pulse flex items-center gap-1 shadow-md">
              <WifiOff className="w-3 h-3" />
              <span>
                {pendingCount} {t('sos.offline.queuedBadge', 'chờ gửi')}
              </span>
            </span>
          )}
        </button>
      </div>

      {/* ── Active SOS Banner Overlay ── */}
      {activeAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-9999 bg-red-950/90 border-2 border-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-md animate-bounce max-w-lg w-full">
          <ShieldAlert className="w-8 h-8 text-yellow-400 shrink-0 animate-spin" />
          <div className="flex-1">
            <h4 className="font-bold text-red-200 text-sm">
              {t('sos.button.activeTitle')}
            </h4>
            <p className="text-xs text-red-300 mt-0.5">
              {t('sos.button.activeDesc')} ({activeAlert.latitude.toFixed(4)},{' '}
              {activeAlert.longitude.toFixed(4)})
            </p>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg border border-red-500/50"
          >
            {t('sos.cancel')}
          </button>
        </div>
      )}

      {/* ── SOS Confirmation & Offline Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b1329] border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10" />

            {/* Modal Header */}
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/40">
                <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {t('sos.button.modalTitle')}
                </h3>
                <p className="text-xs text-red-300">
                  {t('sos.button.modalSubtitle')}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-red-950/40 border border-red-500/20 p-4 rounded-xl">
              {t('sos.button.activeDesc')}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-900/60 border border-red-500 text-red-200 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* STATE 1: Live Alert broadcasted successfully */}
            {activeAlert ? (
              <div className="p-5 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="font-extrabold text-emerald-300 text-base">
                  {t('sos.button.activeTitle')}
                </h4>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  {t('sos.button.standby')}
                </p>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-900/40 p-2 rounded-xl border border-emerald-500/30">
                  GPS: {activeAlert.latitude.toFixed(5)},{' '}
                  {activeAlert.longitude.toFixed(5)}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-lg"
                >
                  {t('sos.cancel')}
                </button>
              </div>
            ) : offlineItem ? (
              /* STATE 2: Offline Queued Alert (No Internet) */
              <div className="p-5 bg-amber-950/60 border-2 border-amber-500/70 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-amber-300">
                  <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40">
                    <WifiOff className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-200 text-sm uppercase tracking-wide">
                      {t('sos.offline.queuedTitle')}
                    </h4>
                    <p className="text-[11px] text-amber-300/80">
                      {t('sos.offline.queuedBadge')} (
                      {new Date(offlineItem.queuedAt).toLocaleTimeString(
                        'vi-VN',
                      )}
                      )
                    </p>
                  </div>
                </div>

                <p className="text-xs text-amber-100/90 leading-relaxed bg-amber-900/30 p-3 rounded-xl border border-amber-500/20">
                  {t('sos.offline.queuedDesc')}
                </p>

                {/* GPS details */}
                <div className="text-xs font-mono text-amber-200 bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <span className="text-slate-400">GPS Đã Lưu:</span>
                  <span className="font-bold">
                    {offlineItem.payload.latitude.toFixed(5)},{' '}
                    {offlineItem.payload.longitude.toFixed(5)}
                  </span>
                </div>

                {/* Emergency Fallback Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={smsHref}
                    className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                  >
                    <MessageSquareWarning className="w-4 h-4" />
                    <span>{t('sos.offline.smsRescue')}</span>
                  </a>

                  <a
                    href={phoneHref}
                    className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t('sos.offline.callHotline')}</span>
                  </a>
                </div>

                {/* VHF Marine Reminder */}
                <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <RadioTower className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{t('sos.offline.vhfReminder')}</span>
                </div>

                {/* Manual retry button & close */}
                <div className="flex items-center gap-2 pt-2 border-t border-amber-500/30">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition cursor-pointer"
                  >
                    {t('sos.cancel')}
                  </button>

                  <button
                    onClick={handleManualRetry}
                    disabled={isRetryingSync}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isRetryingSync ? 'animate-spin' : ''
                      }`}
                    />
                    <span>
                      {isRetryingSync
                        ? t('sos.offline.retrying')
                        : t('sos.offline.retryNow')}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* STATE 3: Initial Trigger Confirmation */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer text-sm"
                >
                  {t('sos.cancel')}
                </button>

                <button
                  onClick={handleTriggerSos}
                  disabled={loading}
                  className="flex-1 py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <Navigation className="w-4 h-4 animate-spin" />
                      <span>{t('sos.button.gettingLocation')}</span>
                    </>
                  ) : (
                    <span>{t('sos.button.confirmTrigger')}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
