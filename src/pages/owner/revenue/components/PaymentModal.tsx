import { CreditCard } from 'lucide-react';
import type { FinancialSummary } from '@/services/billingService';
import BreakdownStep from './payment-modal/BreakdownStep';
import WaitingStep from './payment-modal/WaitingStep';
import SuccessStep from './payment-modal/SuccessStep';
import type { PayStep, PaymentInfo } from './payment-modal/types';

export type { PayStep, PaymentInfo } from './payment-modal/types';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  summary: FinancialSummary;
  formatVND: (value: number) => string;
  payStep: PayStep;
  paying: boolean;
  payment: PaymentInfo;
  onConfirmPayment: () => void;
}

const PaymentModal = ({
  open,
  onClose,
  summary,
  formatVND,
  payStep,
  paying,
  payment,
  onConfirmPayment,
}: PaymentModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-ddms-bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 my-8">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-ddms-secondary" />
            <h3 className="text-lg font-bold text-foreground">
              Thanh toán Dư nợ Hệ thống
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xl p-1 hover:bg-muted rounded-lg border-none bg-transparent"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {payStep === 'breakdown' && (
            <BreakdownStep
              summary={summary}
              formatVND={formatVND}
              paying={paying}
              onClose={onClose}
              onConfirm={onConfirmPayment}
            />
          )}
          {payStep === 'waiting' && (
            <WaitingStep payment={payment} formatVND={formatVND} />
          )}
          {payStep === 'success' && (
            <SuccessStep
              amount={payment.amount}
              formatVND={formatVND}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
