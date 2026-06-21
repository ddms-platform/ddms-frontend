import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const BalanceCard = ({ balance }: { balance: number }) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-xl"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, #112240 0%, #0d1b36 100%)',
      }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00F0FF]/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#00F0FF]/5 blur-3xl" />

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold tracking-wider text-[#00F0FF] uppercase">
          {t('wallet.balanceCard.title')}
        </span>
        <Wallet className="h-6 w-6 text-[#00F0FF]" />
      </div>

      <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
        {formatPrice(balance)}
      </h2>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
        {t('wallet.balanceCard.available')}
      </div>
    </div>
  );
};

export default BalanceCard;
