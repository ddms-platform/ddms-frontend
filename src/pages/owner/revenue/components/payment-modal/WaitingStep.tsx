import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { PaymentInfo } from './types';

interface WaitingStepProps {
  payment: PaymentInfo;
  formatVND: (v: number) => string;
}

const WaitingStep = ({ payment, formatVND }: WaitingStepProps) => (
  <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 animate-pulse dark:text-amber-400">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Đang chờ quét mã thanh toán...
      </div>
    </div>

    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-inner dark:bg-slate-900">
        {payment.bin && payment.accountNumber ? (
          <div className="space-y-3 text-center">
            <img
              src={`https://img.vietqr.io/image/${payment.bin}-${payment.accountNumber}-compact.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.description)}&accountName=${encodeURIComponent(payment.accountName)}`}
              alt="VietQR Payment Code"
              className="mx-auto w-full max-w-60 rounded-lg border border-slate-100 shadow-md"
            />
            <p className="mx-auto max-w-55 text-[10px] font-medium leading-relaxed text-muted-foreground">
              Mở ứng dụng ngân hàng quét mã VietQR để thanh toán nhanh qua
              Napas247
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-ddms-secondary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Đang tải mã QR...</p>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-border bg-ddms-bg-card p-5 text-sm shadow-sm">
        <div className="space-y-3">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Thông tin chuyển khoản
          </h4>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">Ngân hàng</span>
            <span className="font-semibold text-foreground">
              MB Bank (TMCP Quân Đội)
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Số tài khoản
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold text-foreground">
                {payment.accountNumber || '---'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.accountNumber);
                  toast.success('Đã sao chép số tài khoản!');
                }}
                className="h-7 cursor-pointer border-none bg-transparent px-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Sao chép
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Tên người thụ hưởng
            </span>
            <span className="font-bold uppercase text-foreground">
              {payment.accountName || '---'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Số tiền chuyển
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {formatVND(payment.amount)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.amount.toString());
                  toast.success('Đã sao chép số tiền!');
                }}
                className="h-7 cursor-pointer border-none bg-transparent px-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Sao chép
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Nội dung chuyển khoản
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ddms-secondary">
                {payment.description || '---'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.description);
                  toast.success('Đã sao chép nội dung!');
                }}
                className="h-7 cursor-pointer border-none bg-transparent px-2 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Sao chép
              </Button>
            </div>
          </div>
        </div>

        <a
          href={payment.checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Mở liên kết PayOS gốc <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  </div>
);

export default WaitingStep;
