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
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-xs font-semibold animate-pulse dark:text-amber-400">
        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
        Đang chờ quét mã thanh toán...
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center border border-border shadow-inner min-h-80">
        {payment.bin && payment.accountNumber ? (
          <div className="space-y-3 text-center">
            <img
              src={`https://img.vietqr.io/image/${payment.bin}-${payment.accountNumber}-compact.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.description)}&accountName=${encodeURIComponent(payment.accountName)}`}
              alt="VietQR Payment Code"
              className="w-full max-w-60 mx-auto rounded-lg shadow-md border border-slate-100"
            />
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed max-w-55 mx-auto">
              Mở ứng dụng ngân hàng quét mã VietQR để thanh toán nhanh qua
              Napas247
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-ddms-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-muted-foreground">Đang tải mã QR...</p>
          </div>
        )}
      </div>

      <div className="bg-ddms-bg-card border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 text-sm shadow-sm">
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Thông tin chuyển khoản
          </h4>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">Ngân hàng</span>
            <span className="font-semibold text-foreground">
              MB Bank (TMCP Quân Đội)
            </span>
          </div>

          <div className="flex flex-col gap-0.5 relative group">
            <span className="text-[11px] text-muted-foreground">
              Số tài khoản
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-foreground text-base">
                {payment.accountNumber || '---'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.accountNumber);
                  toast.success('Đã sao chép số tài khoản!');
                }}
                className="h-7 text-[10px] text-muted-foreground hover:text-foreground px-2 hover:bg-muted border-none bg-transparent cursor-pointer"
              >
                Sao chép
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Tên người thụ hưởng
            </span>
            <span className="font-bold text-foreground uppercase">
              {payment.accountName || '---'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              Số tiền chuyển
            </span>
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-600 dark:text-amber-400 text-lg">
                {formatVND(payment.amount)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.amount.toString());
                  toast.success('Đã sao chép số tiền!');
                }}
                className="h-7 text-[10px] text-muted-foreground hover:text-foreground px-2 hover:bg-muted border-none bg-transparent cursor-pointer"
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
              <span className="font-semibold text-ddms-secondary text-sm">
                {payment.description || '---'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.description);
                  toast.success('Đã sao chép nội dung!');
                }}
                className="h-7 text-[10px] text-muted-foreground hover:text-foreground px-2 hover:bg-muted border-none bg-transparent cursor-pointer"
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
          className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 border-t border-border"
        >
          Mở liên kết PayOS gốc <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>

    <div className="p-4 bg-muted/50 rounded-xl border border-border text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-ddms-secondary uppercase tracking-wider">
          Mô phỏng thanh toán (Chạy local)
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const curlCmd = `curl -X POST "http://localhost:5015/api/owner/billing/webhook" -H "Content-Type: application/json" -d '{"code":"00","desc":"success","success":true,"data":{"orderCode":${payment.orderCode},"amount":${payment.amount},"description":"Thanh toan test","reference":"TEST_REF_${payment.orderCode}","transactionDateTime":"${new Date().toISOString()}","currency":"VND","paymentLinkId":"test_link_id"},"signature":"test"}'`;
            navigator.clipboard.writeText(curlCmd);
            toast.success('Đã sao chép lệnh CURL test!');
          }}
          className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-2 hover:bg-muted border-none bg-transparent cursor-pointer"
        >
          Sao chép CURL
        </Button>
      </div>
      <div className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre max-h-24 scrollbar-thin bg-black/5 dark:bg-black/40 p-2 rounded-lg border border-border">
        {`curl -X POST "http://localhost:5015/api/owner/billing/webhook" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "00",
    "desc": "success",
    "success": true,
    "data": {
      "orderCode": ${payment.orderCode},
      "amount": ${payment.amount},
      "description": "Thanh toan test",
      "reference": "TEST_REF_${payment.orderCode}",
      "transactionDateTime": "${new Date().toISOString()}",
      "currency": "VND",
      "paymentLinkId": "test_link_id"
    },
    "signature": "test"
  }'`}
      </div>
    </div>
  </div>
);

export default WaitingStep;
