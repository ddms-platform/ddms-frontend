import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  ExternalLink,
  RefreshCw,
  Loader2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  certificateService,
  type CertificateTypeItem,
} from '@/services/certificateService';
import {
  ownerDocumentService,
  type OwnerDocumentListItem,
} from '@/services/ownerDocumentService';
import DateInput from '@/components/ui/date-input';
import { formatDisplayDate, todayIso } from '@/lib/date-format';

export default function OwnerDocumentsPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [documents, setDocuments] = useState<OwnerDocumentListItem[]>([]);
  const [types, setTypes] = useState<CertificateTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [newType, setNewType] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const typeLabel = useCallback(
    (code: string) => {
      const found = types.find((item) => item.code === code);
      if (found) return isEn ? found.nameEn : found.nameVi;
      return code;
    },
    [types, isEn],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, typeList] = await Promise.all([
        ownerDocumentService.list(),
        certificateService
          .getTypes('owner')
          .catch(() => [] as CertificateTypeItem[]),
      ]);
      setDocuments(docs || []);
      setTypes(typeList);
      if (typeList.length > 0) {
        setNewType((prev) =>
          typeList.some((item) => item.code === prev) ? prev : typeList[0].code,
        );
      }
    } catch (err: unknown) {
      const axiosMsg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      toast.error(
        axiosMsg ||
          (err instanceof Error ? err.message : t('ownerDocuments.loadError')),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const existingTypes = useMemo(
    () => new Set(documents.map((d) => d.documentType)),
    [documents],
  );

  const handleUpload = async () => {
    if (!newFile || !newType) return;
    setUploading(true);
    try {
      await ownerDocumentService.uploadOrReplace(
        newType,
        newFile,
        newExpiry || undefined,
      );
      toast.success(
        existingTypes.has(newType)
          ? t('ownerDocuments.replaceSuccess')
          : t('ownerDocuments.uploadSuccess'),
      );
      setNewFile(null);
      setNewExpiry('');
      await fetchData();
    } catch (err: unknown) {
      const axiosMsg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      toast.error(
        axiosMsg ||
          (err instanceof Error
            ? err.message
            : t('ownerDocuments.uploadError')),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('ownerDocuments.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('ownerDocuments.subtitle')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('ownerDocuments.refresh')}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          {t('ownerDocuments.listTitle')}
        </h2>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {t('ownerDocuments.empty')}
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border/60 bg-background p-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText
                    size={20}
                    className="text-ddms-secondary shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {typeLabel(doc.documentType)}
                    </p>
                    {doc.expiryDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('ownerDocuments.expiresOn', {
                          date: formatDisplayDate(doc.expiryDate),
                        })}
                      </p>
                    )}
                    {doc.adminNote && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {t('ownerDocuments.adminNote', {
                          note: doc.adminNote,
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center"
                  title={t('ownerDocuments.viewDocument')}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {types.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus size={16} />
            {t('ownerDocuments.uploadTitle')}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t('ownerDocuments.uploadHint')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ownerDocuments.type')}
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {types.map((type) => (
                  <option key={type.code} value={type.code}>
                    {isEn ? type.nameEn : type.nameVi}
                    {existingTypes.has(type.code)
                      ? ` (${t('ownerDocuments.replaceLabel')})`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ownerDocuments.expiryDate')}
              </label>
              <DateInput
                min={todayIso()}
                value={newExpiry}
                onChange={setNewExpiry}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('ownerDocuments.file')}
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
              disabled={uploading || !newFile || !newType}
              onClick={handleUpload}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {existingTypes.has(newType)
                ? t('ownerDocuments.replace')
                : t('ownerDocuments.upload')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
