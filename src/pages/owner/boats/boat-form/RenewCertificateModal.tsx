import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Certificate } from '@/services/certificateService';

interface RenewCertificateModalProps {
  open: boolean;
  certificate: Certificate | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (file: File, expiryDate: string) => void;
}

const today = new Date().toISOString().split('T')[0];

export default function RenewCertificateModal({
  open,
  certificate,
  isSubmitting,
  onClose,
  onConfirm,
}: RenewCertificateModalProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState('');

  if (!open || !certificate) return null;

  const handleClose = () => {
    setFile(null);
    setExpiryDate('');
    onClose();
  };

  const handleConfirm = () => {
    if (!file || !expiryDate) return;
    onConfirm(file, expiryDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">
            {t('ownerBoats.certificates.renewTitle')}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('ownerBoats.certificates.renewDescription', {
              type: t(
                `ownerBoats.certificates.types.${certificate.certificateType}`,
                certificate.certificateType,
              ),
            })}
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('ownerBoats.certificates.newExpiryDate')}
            </label>
            <input
              type="date"
              min={today}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ddms-secondary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('ownerBoats.certificates.newFile')}
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-ddms-secondary/10 file:px-3 file:py-1.5 file:text-ddms-secondary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {t('ownerBoats.certificates.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!file || !expiryDate || isSubmitting}
              className="px-4 py-2 rounded-md bg-ddms-secondary text-ddms-primary text-sm font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {t('ownerBoats.certificates.renewConfirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
