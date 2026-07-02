import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import {
  walletService,
  type WalletWithdrawalResponse,
} from '@/services/walletService';
import { toast } from 'sonner';
import BalanceCard from './components/BalanceCard';
import WithdrawalForm from './components/WithdrawalForm';
import WithdrawalHistory from './components/WithdrawalHistory';

export default function WalletPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<WalletWithdrawalResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balanceData, withdrawalsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getWithdrawals(),
      ]);
      setBalance(balanceData.balance);
      setWithdrawals(withdrawalsData);
    } catch (e: any) {
      console.error('Failed to load wallet data:', e);
      toast.error(t('wallet.form.validation.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(t('wallet.form.validation.amountError'));
      return;
    }

    if (parsedAmount > balance) {
      setFormError(t('wallet.form.validation.insufficientBalance'));
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setFormError(t('wallet.form.validation.emptyBankInfo'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await walletService.requestWithdraw({
        amount: parsedAmount,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim().toUpperCase(),
      });

      if (res.success) {
        toast.success(
          t('wallet.form.validation.successToast', {
            amount: formatPrice(parsedAmount),
          }),
        );
        setBalance(res.newBalance);
        setAmount('');
        const updatedWithdrawals = await walletService.getWithdrawals();
        setWithdrawals(updatedWithdrawals);
      }
    } catch (err: any) {
      console.error('Withdrawal request failed:', err);
      toast.error(
        err.response?.data?.message || t('wallet.form.validation.errorToast'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {t('wallet.title')}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {t('wallet.subtitle')}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 text-foreground border-foreground/30 hover:bg-foreground/5 bg-ddms-bg-card"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          {t('wallet.updateBtn')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-6">
          <BalanceCard balance={balance} />

          <WithdrawalForm
            balance={balance}
            amount={amount}
            bankName={bankName}
            accountNumber={accountNumber}
            accountName={accountName}
            formError={formError}
            isSubmitting={isSubmitting}
            onAmountChange={setAmount}
            onBankNameChange={setBankName}
            onAccountNumberChange={setAccountNumber}
            onAccountNameChange={setAccountName}
            onSubmit={handleWithdrawSubmit}
          />
        </div>

        <WithdrawalHistory withdrawals={withdrawals} />
      </div>
    </div>
  );
}
