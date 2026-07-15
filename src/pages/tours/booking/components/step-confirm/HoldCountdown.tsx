import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface HoldCountdownProps {
  /** ISO string thời điểm hết hạn giữ chỗ (từ API holdExpiredAt). */
  expiresAt: string;
  /** Gọi khi hết giờ giữ chỗ. */
  onExpire?: () => void;
}

function format(secondsLeft: number): string {
  const s = Math.max(0, secondsLeft);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(h > 0 ? m : m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Thanh cảnh báo vàng + đồng hồ đếm ngược thời gian giữ chỗ.
 * Cập nhật mỗi giây, hết giờ thì chuyển sang trạng thái đã hết hạn.
 */
export default function HoldCountdown({
  expiresAt,
  onExpire,
}: HoldCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );

  useEffect(() => {
    const tick = () => {
      const left = Math.round(
        (new Date(expiresAt).getTime() - Date.now()) / 1000,
      );
      setSecondsLeft(left);
      if (left <= 0) onExpire?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const expired = secondsLeft <= 0;

  if (expired) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
        <AlertTriangle size={22} className="shrink-0 text-red-500" />
        <p className="text-sm font-semibold text-red-500">
          Đã hết thời gian giữ chỗ. Vui lòng đặt lại để tiếp tục.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <Clock size={22} className="shrink-0 animate-pulse text-amber-500" />
      <p className="text-sm text-foreground">
        Booking của bạn đang được giữ. Vui lòng thanh toán trong vòng{' '}
        <span className="font-bold tabular-nums text-amber-600">
          {format(secondsLeft)}
        </span>
        , nếu không hệ thống sẽ tự huỷ để nhả ghế cho khách khác.
      </p>
    </div>
  );
}
