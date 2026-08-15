import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { BookingPaymentInit } from '@/services/bookingService';

interface PaymentPanelProps {
  isCreatingBooking: boolean;
  isPaid: boolean;
  /** Đang gọi PayOS để lấy link thanh toán. */
  isLoadingPayment: boolean;
  payment: BookingPaymentInit | null;
  errorMessage: string | null;
  /** Đang hỏi lại server xem tiền vào chưa. */
  isChecking: boolean;
  displayCode: string;
  totalPrice: number;
  onRetry: () => void;
  onCheckNow: () => void;
}

const Centered = ({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
    {icon}
    <h3 className="text-sm font-bold text-foreground">{title}</h3>
    {description && (
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    )}
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-3 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-semibold text-foreground">{value}</span>
  </div>
);

const PaymentPanel = ({
  isCreatingBooking,
  isPaid,
  isLoadingPayment,
  payment,
  errorMessage,
  isChecking,
  displayCode,
  totalPrice,
  onRetry,
  onCheckNow,
}: PaymentPanelProps) => (
  <div
    className="flex min-h-87.5 flex-col justify-center rounded-xl border p-5 transition-all"
    style={{
      borderColor: 'var(--border)',
      backgroundColor: 'var(--ddms-bg-main)',
    }}
  >
    {isCreatingBooking ? (
      <Centered
        icon={
          <Loader2 className="h-10 w-10 animate-spin text-ddms-secondary" />
        }
        title="Đang khởi tạo giao dịch đặt tour..."
        description="Vui lòng chờ trong giây lát."
      />
    ) : isPaid ? (
      <Centered
        icon={
          <CheckCircle2 size={56} className="animate-bounce text-emerald-500" />
        }
        title="Thanh toán thành công!"
        description="Đang hoàn tất lưu thông tin đặt chỗ..."
      />
    ) : isLoadingPayment ? (
      <Centered
        icon={
          <Loader2 className="h-10 w-10 animate-spin text-ddms-secondary" />
        }
        title="Đang tạo mã thanh toán..."
        description="Hệ thống đang kết nối tới cổng PayOS."
      />
    ) : !payment ? (
      <Centered
        icon={<AlertTriangle size={40} className="text-amber-500" />}
        title="Chưa tạo được mã thanh toán"
        description={
          errorMessage ??
          'Không kết nối được tới cổng thanh toán. Vui lòng thử lại.'
        }
      >
        <Button
          variant="cyan"
          size="action"
          className="gap-2"
          onClick={onRetry}
        >
          <RefreshCw size={14} />
          Thử lại
        </Button>
      </Centered>
    ) : (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ddms-secondary">
            Quét mã để thanh toán
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatPrice(totalPrice)}
          </p>
        </div>

        {payment.qrCode && (
          <div className="flex justify-center">
            <div className="rounded-xl bg-white p-3">
              <QRCode value={payment.qrCode} size={168} />
            </div>
          </div>
        )}

        <div className="space-y-1.5 rounded-lg border border-border p-3">
          {payment.accountName && (
            <InfoRow label="Chủ tài khoản" value={payment.accountName} />
          )}
          {payment.accountNumber && (
            <InfoRow label="Số tài khoản" value={payment.accountNumber} />
          )}
          <InfoRow label="Nội dung" value={`DDMS ${displayCode}`} />
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-ddms-secondary/30 bg-ddms-secondary/5 p-3">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-ddms-secondary"
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Đơn được xác nhận tự động khi PayOS báo đã nhận tiền. Bạn không cần
            bấm gì thêm — cứ để màn hình này mở.
          </p>
        </div>

        {errorMessage && (
          <p className="text-xs leading-relaxed text-red-500">{errorMessage}</p>
        )}

        <div className="flex flex-col gap-2">
          <a
            href={payment.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold text-primary-foreground transition-all active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, var(--ddms-secondary), var(--ring))',
            }}
          >
            <ExternalLink size={14} />
            Mở trang thanh toán PayOS
          </a>

          <Button
            variant="outline"
            size="action"
            disabled={isChecking}
            onClick={onCheckNow}
            className="gap-2 border-foreground/30 text-foreground hover:bg-foreground/5"
          >
            {isChecking ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang kiểm tra giao dịch...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Kiểm tra lại
              </>
            )}
          </Button>
        </div>
      </div>
    )}
  </div>
);

export default PaymentPanel;
