import {
  CreditCard,
  QrCode,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type PaymentMethod = 'vietqr' | 'payos' | null;

interface PaymentPanelProps {
  isCreatingBooking: boolean;
  isPaid: boolean;
  isVerifying: boolean;
  paymentMethod: PaymentMethod;
  webhookReceived: boolean;
  errorMessage: string | null;
  displayCode: string;
  totalPrice: number;
  onSelectMethod: (m: PaymentMethod) => void;
  onClearError: () => void;
  onMarkWebhookReceived: () => void;
  onSubmit: () => void;
}

const MethodSelector = ({
  onSelect,
  onClearError,
}: {
  onSelect: (m: PaymentMethod) => void;
  onClearError: () => void;
}) => (
  <div className="space-y-4 text-center">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Chọn phương thức thanh toán
    </p>
    <div className="grid gap-3 pt-2">
      <button
        onClick={() => {
          onSelect('vietqr');
          onClearError();
        }}
        className="group flex flex-col items-center justify-center rounded-xl border p-4 transition-all hover:scale-[1.02] hover:border-ddms-secondary/40 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: 'var(--ddms-bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <QrCode
          size={32}
          className="text-ddms-secondary transition-transform group-hover:scale-110"
        />
        <span className="mt-2 text-sm font-bold text-foreground">
          Cổng VietQR (Chuyển khoản nhanh)
        </span>
        <span className="text-[10px] text-muted-foreground mt-1">
          Hỗ trợ tất cả ứng dụng ngân hàng Việt Nam
        </span>
      </button>

      <button
        onClick={() => {
          onSelect('payos');
          onClearError();
        }}
        className="group flex flex-col items-center justify-center rounded-xl border p-4 transition-all hover:scale-[1.02] hover:border-ddms-secondary/40 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: 'var(--ddms-bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <CreditCard
          size={32}
          className="text-sky-500 transition-transform group-hover:scale-110"
        />
        <span className="mt-2 text-sm font-bold text-foreground">
          Ví PayOS (Mã QR & Link thanh toán)
        </span>
        <span className="text-[10px] text-muted-foreground mt-1">
          Thanh toán tự động siêu tốc qua PayOS
        </span>
      </button>
    </div>
  </div>
);

const VietQRPanel = ({
  displayCode,
  totalPrice,
  webhookReceived,
  errorMessage,
  onBack,
  onMarkWebhookReceived,
  onSubmit,
}: {
  displayCode: string;
  totalPrice: number;
  webhookReceived: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onMarkWebhookReceived: () => void;
  onSubmit: () => void;
}) => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <button
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
      </button>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Thanh toán VietQR
      </span>
    </div>

    <div className="flex justify-center bg-white p-3 rounded-xl max-w-45 mx-auto shadow-md">
      <img
        src={`https://img.vietqr.io/image/mbbank-0935566373-compact.png?amount=${totalPrice}&addInfo=DATTOUR%20${displayCode}&accountName=DDMS%20PORTAL`}
        alt="VietQR Code"
        className="w-full h-auto"
      />
    </div>

    {errorMessage && (
      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 font-medium leading-relaxed">
        {errorMessage}
      </div>
    )}

    <div className="space-y-2 text-xs text-foreground/80 bg-muted p-3 rounded-xl border border-border">
      <div className="flex justify-between">
        <span>Ngân hàng:</span>
        <span className="font-semibold text-foreground">
          MB Bank (Ngân hàng Quân Đội)
        </span>
      </div>
      <div className="flex justify-between">
        <span>Số tài khoản:</span>
        <span className="font-semibold text-foreground font-mono">
          0935566373
        </span>
      </div>
      <div className="flex justify-between">
        <span>Chủ tài khoản:</span>
        <span className="font-semibold text-foreground">DDMS PORTAL</span>
      </div>
      <div className="flex justify-between">
        <span>Nội dung CK:</span>
        <span className="font-bold text-ddms-secondary">{`DATTOUR ${displayCode}`}</span>
      </div>
      <div className="flex justify-between">
        <span>Số tiền:</span>
        <span className="font-bold text-emerald-500">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </div>

    <div className="pt-2 border-t border-border flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Giả lập ngân hàng xác nhận:</span>
        <span
          className={
            webhookReceived
              ? 'text-emerald-500 font-bold'
              : 'text-amber-500 font-bold'
          }
        >
          {webhookReceived
            ? 'Đã chuyển tiền (Paid)'
            : 'Chưa thanh toán (Pending)'}
        </span>
      </div>
      {!webhookReceived && (
        <button
          onClick={() => {
            onMarkWebhookReceived();
            alert(
              `[Giả lập Webhook] Đã nhận được thông báo chuyển tiền thành công số tiền ${formatPrice(totalPrice)} cho đơn hàng ${displayCode}! Bây giờ bạn có thể nhấn "Đã chuyển khoản".`,
            );
          }}
          className="w-full text-center py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all active:scale-95 cursor-pointer bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
        >
          ⚡ Giả lập nhận tiền thành công (Developer Test)
        </button>
      )}
    </div>

    <div className="flex gap-2 pt-2">
      <Button
        onClick={onBack}
        variant="outline"
        size="action"
        className="flex-1 text-foreground border-foreground/30 hover:bg-foreground/5"
      >
        Quay lại
      </Button>
      <Button
        onClick={onSubmit}
        variant="cyan"
        size="action"
        className="flex-1 font-bold text-xs"
      >
        Đã chuyển khoản
      </Button>
    </div>
  </div>
);

const PayOSPanel = ({
  displayCode,
  totalPrice,
  webhookReceived,
  errorMessage,
  onBack,
  onMarkWebhookReceived,
  onSubmit,
}: {
  displayCode: string;
  totalPrice: number;
  webhookReceived: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onMarkWebhookReceived: () => void;
  onSubmit: () => void;
}) => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <button
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
      </button>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Cổng PayOS
      </span>
    </div>

    <div className="flex flex-col items-center text-center py-2">
      <div className="flex justify-center bg-white p-3 rounded-xl max-w-45 mx-auto shadow-md">
        <img
          src={`https://img.vietqr.io/image/mbbank-0935566373-qr_only.png?amount=${totalPrice}&addInfo=PAYOS%20${displayCode}&accountName=PAYOS%20DDMS`}
          alt="PayOS QR Code"
          className="w-full h-auto"
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 font-medium">
        Quét mã QR PayOS để thanh toán tự động
      </p>
    </div>

    {errorMessage && (
      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 font-medium leading-relaxed">
        {errorMessage}
      </div>
    )}

    <div className="space-y-1 text-[11px] text-center text-muted-foreground">
      <p>
        Số tiền cần thanh toán:{' '}
        <strong className="text-ddms-secondary">
          {formatPrice(totalPrice)}
        </strong>
      </p>
      <p>
        Mã đơn hàng PayOS:{' '}
        <strong className="text-foreground font-mono">#{displayCode}</strong>
      </p>
    </div>

    <div className="pt-2 border-t border-border flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Trạng thái giao dịch PayOS:</span>
        <span
          className={
            webhookReceived
              ? 'text-emerald-500 font-bold'
              : 'text-amber-500 font-bold'
          }
        >
          {webhookReceived ? 'Thành công (Paid)' : 'Chờ thanh toán (Pending)'}
        </span>
      </div>
      {!webhookReceived && (
        <button
          onClick={() => {
            onMarkWebhookReceived();
            alert(
              `[Giả lập Webhook] PayOS thông báo: Đơn hàng #${displayCode} đã thanh toán thành công số tiền ${formatPrice(totalPrice)}! Bây giờ bạn có thể nhấn "Tôi đã thanh toán".`,
            );
          }}
          className="w-full text-center py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all active:scale-95 cursor-pointer bg-sky-500/10 border-sky-500/30 text-sky-500"
        >
          ⚡ Giả lập cổng PayOS thanh toán thành công
        </button>
      )}
    </div>

    <div className="pt-2 flex flex-col gap-2">
      <a
        href={`https://pay.payos.vn/web/checkout-simulated-${displayCode}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          onMarkWebhookReceived();
          alert(
            `Đang chuyển hướng đến cổng thanh toán PayOS để thanh toán đơn hàng ${displayCode}. Bạn đã thanh toán thành công trên cổng PayOS! Nhấn OK để quay lại trang đối soát.`,
          );
        }}
        className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-xs font-bold text-primary-foreground transition-all active:scale-95"
        style={{
          background:
            'linear-gradient(135deg, var(--ddms-secondary), var(--ring))',
        }}
      >
        Mở link thanh toán PayOS
      </a>

      <div className="flex gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          size="action"
          className="flex-1 text-foreground border-foreground/30 hover:bg-foreground/5"
        >
          Quay lại
        </Button>
        <Button
          onClick={onSubmit}
          variant="cyan"
          size="action"
          className="flex-1 font-bold text-xs"
        >
          Tôi đã thanh toán
        </Button>
      </div>
    </div>
  </div>
);

const PaymentPanel = ({
  isCreatingBooking,
  isPaid,
  isVerifying,
  paymentMethod,
  webhookReceived,
  errorMessage,
  displayCode,
  totalPrice,
  onSelectMethod,
  onClearError,
  onMarkWebhookReceived,
  onSubmit,
}: PaymentPanelProps) => {
  const onBack = () => {
    onSelectMethod(null);
    onClearError();
  };

  return (
    <div
      className="rounded-xl border p-5 flex flex-col justify-center min-h-87.5 transition-all"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      {isCreatingBooking ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-ddms-secondary" />
          <h3 className="text-sm font-bold text-foreground">
            Đang khởi tạo giao dịch đặt tour...
          </h3>
          <p className="text-xs text-muted-foreground">
            Vui lòng chờ trong giây lát.
          </p>
        </div>
      ) : isPaid ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
          <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            Thanh toán thành công!
          </h3>
          <p className="text-xs text-muted-foreground">
            Đang hoàn tất lưu thông tin đặt chỗ...
          </p>
        </div>
      ) : isVerifying ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-ddms-secondary" />
          <h3 className="text-sm font-bold text-foreground">
            Đang kiểm tra giao dịch...
          </h3>
          <p className="text-xs text-muted-foreground">
            Đang truy vấn trạng thái thanh toán từ hệ thống đối soát...
          </p>
        </div>
      ) : paymentMethod === null ? (
        <MethodSelector onSelect={onSelectMethod} onClearError={onClearError} />
      ) : paymentMethod === 'vietqr' ? (
        <VietQRPanel
          displayCode={displayCode}
          totalPrice={totalPrice}
          webhookReceived={webhookReceived}
          errorMessage={errorMessage}
          onBack={onBack}
          onMarkWebhookReceived={onMarkWebhookReceived}
          onSubmit={onSubmit}
        />
      ) : (
        <PayOSPanel
          displayCode={displayCode}
          totalPrice={totalPrice}
          webhookReceived={webhookReceived}
          errorMessage={errorMessage}
          onBack={onBack}
          onMarkWebhookReceived={onMarkWebhookReceived}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default PaymentPanel;
