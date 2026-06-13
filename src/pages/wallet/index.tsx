import { useState, useEffect } from 'react';
import {
  Wallet,
  Landmark,
  RefreshCw,
  Send,
  History,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import {
  walletService,
  type WalletWithdrawalResponse,
} from '@/services/walletService';
import { toast } from 'sonner';

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<WalletWithdrawalResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
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
      toast.error('Không thể tải thông tin ví của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Số tiền rút phải lớn hơn 0.');
      return;
    }

    if (parsedAmount > balance) {
      setFormError('Số dư ví không đủ.');
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setFormError('Vui lòng nhập đầy đủ thông tin ngân hàng.');
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
          `Yêu cầu rút tiền ${formatPrice(parsedAmount)} đang được xử lý!`,
        );
        setBalance(res.newBalance);
        // Reset form
        setAmount('');
        // Refresh withdrawal list
        const updatedWithdrawals = await walletService.getWithdrawals();
        setWithdrawals(updatedWithdrawals);
      }
    } catch (err: any) {
      console.error('Withdrawal request failed:', err);
      toast.error(err.response?.data?.message || 'Yêu cầu rút tiền thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: WalletWithdrawalResponse['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={12} />
            Đang xử lý
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={12} />
            Thành công
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle size={12} />
            Từ chối
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Ví Của Tôi
          </h1>
          <p className="mt-2 text-base text-[#ecf0ff]">
            Quản lý số dư hoàn tiền của bạn và thực hiện yêu cầu rút tiền về
            ngân hàng.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backgroundColor: '#112240',
            color: '#ffffff',
          }}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Cập nhật
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left column: Card + Form */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Balance Card */}
          <div
            className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-xl"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, #112240 0%, #0d1b36 100%)',
            }}
          >
            {/* Background glowing spot */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00F0FF]/10 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#00F0FF]/5 blur-3xl" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold tracking-wider text-[#00F0FF] uppercase">
                Số Dư Ví
              </span>
              <Wallet className="h-6 w-6 text-[#00F0FF]" />
            </div>

            <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
              {formatPrice(balance)}
            </h2>

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
              Tài khoản khả dụng
            </div>
          </div>

          {/* Withdrawal Form */}
          <div
            className="rounded-2xl border p-6 shadow-md"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
              backgroundColor: '#112240',
            }}
          >
            <div
              className="flex items-center gap-2 mb-6 border-b pb-4"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <Landmark className="h-5 w-5 text-[#00F0FF]" />
              <h3 className="text-lg font-bold text-white">
                Yêu Cầu Rút Tiền Về Ngân Hàng
              </h3>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#ecf0ff] uppercase tracking-wider mb-2">
                    Tên Ngân Hàng
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Vietcombank, MB Bank..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm bg-[#0a192f] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#ecf0ff] uppercase tracking-wider mb-2">
                    Số Tài Khoản
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập số tài khoản"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm bg-[#0a192f] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ecf0ff] uppercase tracking-wider mb-2">
                  Tên Chủ Tài Khoản (Không Dấu)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm bg-[#0a192f] text-white uppercase focus:outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ecf0ff] uppercase tracking-wider mb-2">
                  Số Tiền Rút (đ)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={balance}
                  placeholder="Nhập số tiền muốn rút"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm bg-[#0a192f] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Tối đa có thể rút: {formatPrice(balance)}</span>
                  <button
                    type="button"
                    onClick={() => setAmount(balance.toString())}
                    className="text-[#00F0FF] hover:underline"
                  >
                    Rút tối đa
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
                  'Đang xử lý yêu cầu...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={16} />
                    Gửi yêu cầu rút tiền
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right column: Withdrawal history */}
        <div className="flex flex-col gap-6">
          <div
            className="rounded-2xl border p-6 shadow-md flex-1 flex flex-col h-full"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
              backgroundColor: '#112240',
            }}
          >
            <div
              className="flex items-center gap-2 mb-6 border-b pb-4"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <History className="h-5 w-5 text-[#00F0FF]" />
              <h3 className="text-lg font-bold text-white">Lịch Sử Rút Tiền</h3>
            </div>

            <div className="flex-1 overflow-y-auto max-h-105 pr-2 no-scrollbar flex flex-col gap-4">
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-xl border p-4 flex flex-col gap-2 transition-all hover:bg-white/5"
                    style={{
                      borderColor: 'rgba(255,255,255,0.06)',
                      backgroundColor: '#0d1b36',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-base">
                        -{formatPrice(w.amount)}
                      </span>
                      {getStatusBadge(w.status)}
                    </div>
                    <div
                      className="text-xs text-[#ecf0ff] space-y-1 mt-1 border-t pt-2"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <p className="flex justify-between">
                        <span className="text-slate-400">Ngân hàng:</span>
                        <span className="font-medium">{w.bankName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Tài khoản:</span>
                        <span className="font-medium">{w.accountNumber}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Chủ TK:</span>
                        <span className="font-medium uppercase">
                          {w.accountName}
                        </span>
                      </p>
                      <p className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Ngày yêu cầu:</span>
                        <span>
                          {new Date(w.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                  <Clock size={36} className="text-slate-600 mb-2" />
                  <p className="text-sm">Chưa có giao dịch rút tiền nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
