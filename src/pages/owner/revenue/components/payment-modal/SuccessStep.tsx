import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessStepProps {
  amount: number;
  formatVND: (v: number) => string;
  onClose: () => void;
}

const SuccessStep = ({ amount, formatVND, onClose }: SuccessStepProps) => (
  <div className="space-y-6 text-center py-8">
    <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
      </div>
      <div>
        <h4 className="text-xl font-black text-emerald-400">
          Thanh toán Thành công!
        </h4>
        <p className="text-sm text-slate-300 mt-1">
          Hệ thống đã nhận được số tiền{' '}
          <span className="font-bold text-white">{formatVND(amount)}</span>.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Dư nợ đã được khấu trừ và tự động cập nhật.
        </p>
      </div>
    </div>

    <Button
      onClick={onClose}
      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-none"
    >
      Đóng cửa sổ
    </Button>
  </div>
);

export default SuccessStep;
