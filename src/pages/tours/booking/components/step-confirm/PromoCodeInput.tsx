import { useState } from 'react';
import { Loader2, Tag, X } from 'lucide-react';
import { bookingService, type BookingQuote } from '@/services/bookingService';

interface PromoCodeInputProps {
  /** Đơn đang chờ thanh toán. Chưa có thì ô nhập bị khoá. */
  bookingId: string | null;
  /** Mã đang áp, null nếu chưa áp mã nào. */
  applied: BookingQuote | null;
  onApplied: (quote: BookingQuote) => void;
  onRemoved: (quote: BookingQuote) => void;
}

const PromoCodeInput = ({
  bookingId,
  applied,
  onApplied,
  onRemoved,
}: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed || !bookingId || busy) return;

    setBusy(true);
    setError(null);
    try {
      onApplied(await bookingService.applyPromotion(bookingId, trimmed));
      setCode('');
    } catch (err: any) {
      // Backend trả mã lỗi riêng cho từng nguyên nhân (hết hạn, chưa đủ đơn tối
      // thiểu, hết lượt...) kèm message tiếng Việt — hiển thị thẳng cho khách.
      setError(
        err?.response?.data?.message ??
          err?.message ??
          'Không áp được mã giảm giá. Vui lòng thử lại.',
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!bookingId || busy) return;
    setBusy(true);
    setError(null);
    try {
      onRemoved(await bookingService.removePromotion(bookingId));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Không gỡ được mã.',
      );
    } finally {
      setBusy(false);
    }
  };

  if (applied?.promotionCode) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Tag size={14} className="shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {applied.promotionCode}
            </p>
            {applied.promotionDescription && (
              <p className="truncate text-[11px] text-muted-foreground">
                {applied.promotionDescription}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          aria-label="Gỡ mã giảm giá"
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <X size={14} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          disabled={!bookingId || busy}
          placeholder="Nhập mã giảm giá"
          className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 text-xs uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground focus:border-ddms-secondary focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={apply}
          disabled={!bookingId || busy || !code.trim()}
          className="h-9 shrink-0 rounded-lg bg-ddms-secondary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : 'Áp dụng'}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

export default PromoCodeInput;
