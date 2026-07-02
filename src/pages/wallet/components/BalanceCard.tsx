import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const BalanceCard = ({ balance }: { balance: number }) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-xl"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ddms-bg-card)',
      }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ddms-secondary/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-ddms-secondary/5 blur-3xl" />

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold tracking-wider text-ddms-secondary uppercase">
          {t('wallet.balanceCard.title')}
        </span>
        <Wallet className="h-6 w-6 text-ddms-secondary" />
      </div>

      <h2 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
        {formatPrice(balance)}
      </h2>

      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-ddms-secondary animate-pulse" />
        {t('wallet.balanceCard.available')}
      </div>
    </div>
  );
};

export default BalanceCard;
