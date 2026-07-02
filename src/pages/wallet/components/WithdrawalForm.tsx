import { useTranslation } from 'react-i18next';
import { Landmark, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface WithdrawalFormProps {
  balance: number;
  amount: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  formError: string | null;
  isSubmitting: boolean;
  onAmountChange: (v: string) => void;
  onBankNameChange: (v: string) => void;
  onAccountNumberChange: (v: string) => void;
  onAccountNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  'w-full rounded-xl border px-4 py-2.5 text-sm bg-ddms-bg-main text-foreground focus:outline-none focus:ring-1 focus:ring-ddms-secondary transition-all';
const inputStyle = { borderColor: 'var(--border)' };
const labelClass =
  'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2';

const WithdrawalForm = ({
  balance,
  amount,
  bankName,
  accountNumber,
  accountName,
  formError,
  isSubmitting,
  onAmountChange,
  onBankNameChange,
  onAccountNumberChange,
  onAccountNameChange,
  onSubmit,
}: WithdrawalFormProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-2xl border p-6 shadow-md"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ddms-bg-card)',
      }}
    >
      <div
        className="flex items-center gap-2 mb-6 border-b pb-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <Landmark className="h-5 w-5 text-ddms-secondary" />
        <h3 className="text-lg font-bold text-foreground">
          {t('wallet.form.title')}
        </h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {formError && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t('wallet.form.bankName')}</label>
            <input
              type="text"
              required
              placeholder={t('wallet.form.bankNamePlaceholder')}
              value={bankName}
              onChange={(e) => onBankNameChange(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t('wallet.form.accountNumber')}
            </label>
            <input
              type="text"
              required
              placeholder={t('wallet.form.accountNumberPlaceholder')}
              value={accountNumber}
              onChange={(e) => onAccountNumberChange(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t('wallet.form.accountName')}</label>
          <input
            type="text"
            required
            placeholder={t('wallet.form.accountNamePlaceholder')}
            value={accountName}
            onChange={(e) => onAccountNameChange(e.target.value)}
            className={`${inputClass} uppercase`}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass}>{t('wallet.form.amount')}</label>
          <input
            type="number"
            required
            min="1"
            max={balance}
            placeholder={t('wallet.form.amountPlaceholder')}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>
              {t('wallet.form.maxWithdraw', { balance: formatPrice(balance) })}
            </span>
            <button
              type="button"
              onClick={() => onAmountChange(balance.toString())}
              className="text-ddms-secondary hover:underline"
            >
              {t('wallet.form.maxWithdrawBtn')}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="cyan"
          disabled={isSubmitting || balance <= 0}
          className="w-full py-3 font-bold text-sm tracking-wide uppercase transition-all rounded-xl"
        >
          {isSubmitting ? (
            t('wallet.form.submittingBtn')
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send size={16} />
              {t('wallet.form.submitBtn')}
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default WithdrawalForm;
