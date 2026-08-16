import { useTranslation } from 'react-i18next';
import { Landmark, Send, AlertCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  isLocked?: boolean;
  isPendingReview?: boolean;
  lockReason?: string;
  onAmountChange: (v: string) => void;
  onBankNameChange: (v: string) => void;
  onAccountNumberChange: (v: string) => void;
  onAccountNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  'w-full rounded-xl border px-4 py-2.5 text-sm bg-ddms-bg-main text-foreground focus:outline-none focus:ring-1 focus:ring-ddms-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed';
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
  isLocked = false,
  isPendingReview = false,
  lockReason,
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

      {isLocked && (
        <div
          className={`mb-4 rounded-xl p-4 text-xs flex items-start gap-3 border ${
            isPendingReview
              ? 'bg-blue-500/10 border-blue-500/25 text-blue-300'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
          }`}
        >
          <Lock
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              isPendingReview ? 'text-blue-400' : 'text-rose-400'
            }`}
          />
          <div className="space-y-1">
            <p
              className={`font-bold ${
                isPendingReview ? 'text-blue-200' : 'text-rose-200'
              }`}
            >
              {isPendingReview
                ? 'Hồ sơ pháp lý đang chờ Ban quản trị duyệt'
                : 'Chức năng rút tiền đang tạm khóa'}
            </p>
            <p className="leading-relaxed opacity-90">
              {lockReason ||
                (isPendingReview
                  ? 'Hồ sơ của bạn đã nộp đầy đủ và đang chờ Admin duyệt. Tính năng rút tiền sẽ tự động mở lại ngay sau khi được Admin phê duyệt.'
                  : 'Tài khoản của bạn chưa hoàn tất các giấy tờ pháp lý bắt buộc (đã quá thời hạn nộp). Vui lòng bổ sung đầy đủ giấy tờ để gửi Admin xét duyệt và mở lại tính năng rút tiền.')}
            </p>
            <Link
              to="/owner/documents"
              className={`inline-block pt-1 font-bold hover:underline ${
                isPendingReview ? 'text-blue-300' : 'text-amber-400'
              }`}
            >
              👉 Đến trang Hồ sơ giấy tờ &rarr;
            </Link>
          </div>
        </div>
      )}

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
              disabled={isLocked}
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
              disabled={isLocked}
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
            disabled={isLocked}
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
            disabled={isLocked}
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
            {!isLocked && (
              <button
                type="button"
                onClick={() => onAmountChange(balance.toString())}
                className="text-ddms-secondary hover:underline cursor-pointer"
              >
                {t('wallet.form.maxWithdrawBtn')}
              </button>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant={
            isLocked ? (isPendingReview ? 'default' : 'destructive') : 'cyan'
          }
          disabled={isSubmitting || balance <= 0 || isLocked}
          className="w-full py-3 font-bold text-sm tracking-wide uppercase transition-all rounded-xl cursor-pointer disabled:cursor-not-allowed"
        >
          {isLocked ? (
            <span className="flex items-center justify-center gap-2">
              <Lock size={16} />
              {isPendingReview
                ? 'Tạm khóa rút tiền (Đang chờ Admin duyệt hồ sơ)'
                : 'Tạm khóa rút tiền do quá hạn hồ sơ'}
            </span>
          ) : isSubmitting ? (
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
