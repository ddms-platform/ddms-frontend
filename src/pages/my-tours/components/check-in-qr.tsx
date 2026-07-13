import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { ChevronDown, ChevronUp, Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface CheckInQrProps {
  bookingId: string;
  bookingCode: string;
}

export function buildCheckInQrPayload(bookingId: string, bookingCode: string) {
  return JSON.stringify({ bookingId, bookingCode });
}

export default function CheckInQr({ bookingId, bookingCode }: CheckInQrProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const payload = useMemo(
    () => buildCheckInQrPayload(bookingId, bookingCode),
    [bookingId, bookingCode],
  );

  const downloadQr = useCallback(() => {
    const svg = qrContainerRef.current?.querySelector('svg');
    if (!svg) {
      toast.error(
        t('dashboard.checkInQr.downloadError', 'Không thể tải mã QR'),
      );
      return;
    }

    const padding = 16;
    const size = 148;
    const canvas = document.createElement('canvas');
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `ddms-checkin-${bookingCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(t('dashboard.checkInQr.downloadSuccess', 'Đã tải mã QR'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error(
        t('dashboard.checkInQr.downloadError', 'Không thể tải mã QR'),
      );
    };

    img.src = url;
  }, [bookingCode, t]);

  return (
    <div
      className="mt-4 rounded-xl border overflow-hidden"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <QrCode size={16} className="text-ddms-secondary" />
          {isOpen
            ? t('dashboard.checkInQr.hide', 'Ẩn mã QR check-in')
            : t('dashboard.checkInQr.show', 'Hiện mã QR check-in')}
        </span>
        {isOpen ? (
          <ChevronUp size={18} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div
          className="border-t px-4 pb-4 pt-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="mb-3 flex items-center justify-end">
            <button
              type="button"
              onClick={downloadQr}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-foreground/5"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              title={t('dashboard.checkInQr.download', 'Tải mã QR')}
            >
              <Download size={14} />
              {t('dashboard.checkInQr.download', 'Tải xuống')}
            </button>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            {t(
              'dashboard.checkInQr.description',
              'Xuất trình mã QR này tại cảng để nhân viên quét và ghi nhận lên tàu.',
            )}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <div ref={qrContainerRef} className="rounded-xl bg-white p-3">
              <QRCode value={payload} size={148} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('dashboard.checkInQr.codeLabel', 'Mã vé')}
              </p>
              <p className="mt-1 font-mono text-lg font-bold tracking-widest text-foreground">
                {bookingCode}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
