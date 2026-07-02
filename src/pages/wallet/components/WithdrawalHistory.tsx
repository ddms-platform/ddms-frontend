import { useTranslation } from 'react-i18next';
import { History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { WalletWithdrawalResponse } from '@/services/walletService';

const WithdrawalStatusBadge = ({
  status,
}: {
  status: WalletWithdrawalResponse['status'];
}) => {
  const { t } = useTranslation();
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock size={12} />
          {t('wallet.history.status.pending')}
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle size={12} />
          {t('wallet.history.status.approved')}
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle size={12} />
          {t('wallet.history.status.rejected')}
        </span>
      );
    default:
      return null;
  }
};

interface WithdrawalHistoryProps {
  withdrawals: WalletWithdrawalResponse[];
}

const WithdrawalHistory = ({ withdrawals }: WithdrawalHistoryProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl border p-6 shadow-md flex-1 flex flex-col h-full"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--ddms-bg-card)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-6 border-b pb-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <History className="h-5 w-5 text-ddms-secondary" />
          <h3 className="text-lg font-bold text-foreground">
            {t('wallet.history.title')}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto max-h-105 pr-2 no-scrollbar flex flex-col gap-4">
          {withdrawals.length > 0 ? (
            withdrawals.map((w) => (
              <div
                key={w.id}
                className="rounded-xl border p-4 flex flex-col gap-2 transition-all hover:bg-foreground/5 border-border bg-ddms-bg-main"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-foreground text-base">
                    -{formatPrice(w.amount)}
                  </span>
                  <WithdrawalStatusBadge status={w.status} />
                </div>
                <div
                  className="text-xs text-foreground/80 space-y-1 mt-1 border-t pt-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('wallet.history.bank')}
                    </span>
                    <span className="font-medium">{w.bankName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('wallet.history.account')}
                    </span>
                    <span className="font-medium">{w.accountNumber}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('wallet.history.holder')}
                    </span>
                    <span className="font-medium uppercase">
                      {w.accountName}
                    </span>
                  </p>
                  <p className="flex justify-between text-[10px] text-muted-foreground/60 mt-1">
                    <span>{t('wallet.history.date')}</span>
                    <span>
                      {new Date(w.createdAt).toLocaleString(i18n.language)}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <Clock size={36} className="text-muted-foreground/50 mb-2" />
              <p className="text-sm">{t('wallet.history.empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalHistory;
