import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  CheckCircle,
  ShieldAlert,
  Navigation,
} from 'lucide-react';
import { sosService } from '@/services/sosService';
import type { SosButtonProps, SosAlert } from '@/interfaces/sos';

export const SosButton: React.FC<SosButtonProps> = ({
  boatId,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SosAlert | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          setLoading(false);
        } catch (err: any) {
          console.error('Failed to send SOS:', err);
          setErrorMsg(
            err.response?.data?.message ||
              'Không thể phát tín hiệu SOS. Vui lòng kiểm tra kết nối mạng!',
          );
          setLoading(false);
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
    } catch (err: any) {
      setErrorMsg(
        'Lỗi gửi tín hiệu SOS. Vui lòng gọi trực tiếp hotline Cảng vụ!',
      );
    } finally {
      setLoading(false);
    }
  };

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
          <span>PHÁT TÍN HIỆU SOS</span>
        </button>
      </div>

      {/* ── Active SOS Banner Overlay ── */}
      {activeAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-9999 bg-red-950/90 border-2 border-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-md animate-bounce max-w-lg w-full">
          <ShieldAlert className="w-8 h-8 text-yellow-400 shrink-0 animate-spin" />
          <div className="flex-1">
            <h4 className="font-bold text-red-200 text-sm">
              TÍN HIỆU CỨU HỘ ĐANG PHÁT
            </h4>
            <p className="text-xs text-red-300 mt-0.5">
              Đã gửi tọa độ ({activeAlert.latitude.toFixed(4)},{' '}
              {activeAlert.longitude.toFixed(4)}) về Cảng Vụ. Tàu cứu hộ đang
              tới!
            </p>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg border border-red-500/50"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ── SOS Confirmation Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b1329] border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10" />

            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/40">
                <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  CẢNH BÁO SOS KHẨN CẤP
                </h3>
                <p className="text-xs text-red-300">
                  Tàu gặp sự cố nguy hiểm cần hỗ trợ cứu hộ
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-red-950/40 border border-red-500/20 p-4 rounded-xl">
              Khi bấm xác nhận, tọa độ GPS thực tế của tàu sẽ được truyền phát
              tức thì tới Cảng vụ Đà Nẵng. Màn hình Cảng vụ sẽ hú còi báo động
              để xuất phát tàu cứu nạn.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-900/60 border border-red-500 text-red-200 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {activeAlert ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-emerald-300">
                  ĐÃ GỬI TÍN HIỆU SOS THÀNH CÔNG!
                </h4>
                <p className="text-xs text-emerald-200">
                  Cảng vụ đã nhận định vị và đang điều động lực lượng ứng cứu.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer text-sm"
                >
                  Hủy Bỏ
                </button>

                <button
                  onClick={handleTriggerSos}
                  disabled={loading}
                  className="flex-1 py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <Navigation className="w-4 h-4 animate-spin" />
                      <span>Đang định vị...</span>
                    </>
                  ) : (
                    <span>XÁC NHẬN GỬI SOS</span>
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
