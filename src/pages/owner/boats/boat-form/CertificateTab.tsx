import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/badges';
import {
  certificateService,
  type Certificate,
  type CertificateTypeItem,
} from '@/services/certificateService';
import RenewCertificateModal from './RenewCertificateModal';

interface CertificateTabProps {
  boatId?: string;
  onChanged?: () => void;
}

const today = new Date().toISOString().split('T')[0];

const STATUS_VARIANT: Record<
  string,
  'ownerPending' | 'ownerIdle' | 'error' | 'warning' | 'ownerAttention'
> = {
  pending: 'ownerPending',
  approved: 'ownerIdle',
  rejected: 'error',
  expired: 'warning',
};

export default function CertificateTab({
  boatId,
  onChanged,
}: CertificateTabProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certTypes, setCertTypes] = useState<CertificateTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [renewTarget, setRenewTarget] = useState<Certificate | null>(null);
  const [renewing, setRenewing] = useState(false);

  const [newType, setNewType] = useState<string>('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const typeLabel = useCallback(
    (code: string) => {
      const found = certTypes.find((t) => t.code === code);
      if (found) return isEn ? found.nameEn : found.nameVi;
      return t(`ownerBoats.certificates.types.${code}`, code);
    },
    [certTypes, isEn, t],
  );

  const loadCertificates = useCallback(async () => {
    if (!boatId) return;
    setLoading(true);
    try {
      const [data, types] = await Promise.all([
        certificateService.getByBoatId(boatId),
        certificateService.getTypes().catch(() => [] as CertificateTypeItem[]),
      ]);
      setCertificates(data);
      setCertTypes(types);
      if (types.length > 0) {
        setNewType((prev) =>
          types.some((t) => t.code === prev) ? prev : types[0].code,
        );
      }
    } catch {
      toast.error(t('ownerBoats.certificates.loadError'));
    } finally {
      setLoading(false);
    }
  }, [boatId, t]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const availableTypes = useMemo(() => {
    const used = new Set(certificates.map((c) => c.certificateType));
    return certTypes.filter((type) => !used.has(type.code));
  }, [certTypes, certificates]);

  useEffect(() => {
    if (
      availableTypes.length > 0 &&
      !availableTypes.some((t) => t.code === newType)
    ) {
      setNewType(availableTypes[0].code);
    }
  }, [availableTypes, newType]);

  const handleUpload = async () => {
    if (!boatId || !newFile || !newExpiry || !newType) return;
    setUploading(true);
    try {
      await certificateService.upload(boatId, newType, newFile, newExpiry);
      toast.success(t('ownerBoats.certificates.uploadSuccess'));
      setNewFile(null);
      setNewExpiry('');
      await loadCertificates();
      onChanged?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t('ownerBoats.certificates.uploadError');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRenew = async (file: File, expiryDate: string) => {
    if (!boatId || !renewTarget) return;
    setRenewing(true);
    try {
      await certificateService.renew(boatId, renewTarget.id, file, expiryDate);
      toast.success(t('ownerBoats.certificates.renewSuccess'));
      setRenewTarget(null);
      await loadCertificates();
      onChanged?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t('ownerBoats.certificates.renewError');
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  if (!boatId) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
        <p className="text-sm text-muted-foreground">
          {t('ownerBoats.certificates.saveBoatFirst')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-ddms-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          {t('ownerBoats.certificates.listTitle')}
        </h3>

        {certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('ownerBoats.certificates.empty')}
          </p>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => {
              const canRenew =
                cert.status === 'expired' || cert.status === 'rejected';
              return (
                <div
                  key={cert.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border/60 bg-background p-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText
                      size={20}
                      className="text-ddms-secondary shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {typeLabel(cert.certificateType)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('ownerBoats.certificates.expiresOn', {
                          date: cert.expiryDate,
                        })}
                      </p>
                      {cert.rejectionReason && (
                        <p className="text-xs text-red-400 mt-1">
                          {t('ownerBoats.certificates.rejectionReason', {
                            reason: cert.rejectionReason,
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      label={t(
                        `ownerBoats.certificates.status.${cert.status}`,
                        cert.status,
                      )}
                      variant={STATUS_VARIANT[cert.status] ?? 'ownerPending'}
                    />
                    <a
                      href={cert.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={t('ownerBoats.certificates.viewDocument')}
                    >
                      <ExternalLink size={16} />
                    </a>
                    {canRenew && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setRenewTarget(cert)}
                      >
                        <RefreshCw size={14} />
                        {t('ownerBoats.certificates.renew')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {availableTypes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus size={16} />
            {t('ownerBoats.certificates.addTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ownerBoats.certificates.type')}
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {availableTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {isEn ? type.nameEn : type.nameVi}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ownerBoats.certificates.expiryDate')}
              </label>
              <input
                type="date"
                min={today}
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ownerBoats.certificates.file')}
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-ddms-secondary/20 file:px-3 file:py-1.5 file:text-sm file:text-ddms-secondary"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={uploading || !newFile || !newExpiry || !newType}
              onClick={handleUpload}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {t('ownerBoats.certificates.upload')}
            </Button>
          </div>
        </div>
      )}

      <RenewCertificateModal
        open={!!renewTarget}
        certificate={renewTarget}
        submitting={renewing}
        onClose={() => !renewing && setRenewTarget(null)}
        onConfirm={handleRenew}
      />
    </div>
  );
}
