import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CancelBookingModalProps {
  open: boolean;
  booking: any | null;
  reason: string;
  isUpdating: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelBookingModal = ({
  open,
  booking,
  reason,
  isUpdating,
  onReasonChange,
  onClose,
  onConfirm,
}: CancelBookingModalProps) => {
  const { t } = useTranslation();

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] w-full max-w-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {t('ownerTours.cancelModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm text-slate-300 mb-3">
              {t('ownerTours.cancelModal.warningMessage', {
                bookingId: booking.bookingId,
                customerName: booking.customerName,
              })}
            </p>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('ownerTours.cancelModal.reasonLabel')}
            </label>
            <textarea
              className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors h-24 resize-none"
              placeholder={t('ownerTours.cancelModal.reasonPlaceholder')}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              {t('ownerTours.cancelModal.cancelBtn')}
            </button>
            <button
              onClick={onConfirm}
              disabled={!reason.trim() || isUpdating}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition-colors text-sm font-bold disabled:opacity-50"
            >
              {t('ownerTours.cancelModal.confirmCancelBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
