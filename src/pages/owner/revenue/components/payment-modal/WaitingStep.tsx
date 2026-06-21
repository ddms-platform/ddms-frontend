import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { PaymentInfo } from './types';

interface WaitingStepProps {
  payment: PaymentInfo;
  formatVND: (v: number) => string;
}

const WaitingStep = ({ payment, formatVND }: WaitingStepProps) => (
  <div className="space-y-6 py-2">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold animate-pulse">
        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
        Đang chờ quét mã thanh toán...
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-800 shadow-inner min-h-80">
        {payment.bin && payment.accountNumber ? (
          <div className="space-y-3 text-center">
            <img
              src={`https://img.vietqr.io/image/${payment.bin}-${payment.accountNumber}-compact.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.description)}&accountName=${encodeURIComponent(payment.accountName)}`}
              alt="VietQR Payment Code"
              className="w-full max-w-60 mx-auto rounded-lg shadow-md border border-slate-100"
            />
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-55 mx-auto">
              Mở ứng dụng ngân hàng quét mã VietQR để thanh toán nhanh qua
              Napas247
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Đang tải mã QR...</p>
          </div>
        )}
      </div>

      <div className="bg-[#111C3A]/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 text-sm">
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Thông tin chuyển khoản
          </h4>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-slate-400">Ngân hàng</span>
            <span className="font-semibold text-slate-200">
              MB Bank (TMCP Quân Đội)
            </span>
          </div>

          <div className="flex flex-col gap-0.5 relative group">
            <span className="text-[11px] text-slate-400">Số tài khoản</span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-200 text-base">
                {payment.accountNumber || '---'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.accountNumber);
                  toast.success('Đã sao chép số tài khoản!');
                }}
                className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
              >
                Sao chép
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-slate-400">
              Tên người thụ hưởng
            </span>
            <span className="font-bold text-slate-200 uppercase">
              {payment.accountName || '---'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-slate-400">Số tiền chuyển</span>
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-400 text-lg">
                {formatVND(payment.amount)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.amount.toString());
                  toast.success('Đã sao chép số tiền!');
                }}
                className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
              >
                Sao chép
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-slate-400">
              Nội dung chuyển khoản
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400 text-sm">
                {payment.description || '---'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(payment.description);
                  toast.success('Đã sao chép nội dung!');
                }}
                className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
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
          className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-450 hover:text-slate-200 transition-colors pt-2 border-t border-slate-800/80"
        >
          Mở liên kết PayOS gốc <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>

    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
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
          className="h-6 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
        >
          Sao chép CURL
        </Button>
      </div>
      <div className="font-mono text-[9px] text-emerald-400 overflow-x-auto whitespace-pre max-h-24 scrollbar-thin bg-black/40 p-2 rounded-lg border border-slate-900">
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
