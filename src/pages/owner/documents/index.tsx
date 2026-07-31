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
  FolderOpen,
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
        ownerDocumentService.list().catch(() => [] as OwnerDocumentListItem[]),
        certificateService
          .getTypes('owner')
          .catch(() => [] as CertificateTypeItem[]),
      ]);
      setDocuments(docs || []);
      const fetchedTypes = typeList || [];
      setTypes(fetchedTypes);
      if (fetchedTypes.length > 0) {
        setNewType((prev) =>
          fetchedTypes.some((item) => item.code === prev)
            ? prev
            : fetchedTypes[0].code,
        );
      }
    } catch {
      // Ignore top-level rejection
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
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
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
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
      {/* Page Header */}
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
          className="gap-2 border-border text-foreground hover:bg-muted"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('ownerDocuments.refresh')}
        </Button>
      </div>

      {/* Uploaded Documents List Card */}
      <div className="bg-ddms-bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2.5">
          <FileText size={18} className="text-ddms-secondary shrink-0" />
          <span>{t('ownerDocuments.listTitle')}</span>
        </h2>

        {loading ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-16 w-full rounded-xl bg-muted/40" />
            <Skeleton className="h-16 w-full rounded-xl bg-muted/40" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {t('ownerDocuments.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border/70 bg-ddms-bg-main/60 p-4 transition-colors hover:border-ddms-secondary/40"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-lg bg-ddms-secondary/10 shrink-0 mt-0.5">
                    <FileText
                      size={20}
                      className="text-ddms-secondary shrink-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
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
                      <p className="text-xs text-amber-500 mt-1 font-medium">
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
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors self-start sm:self-center"
                  title={t('ownerDocuments.viewDocument')}
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Form Card */}
      <div className="bg-ddms-bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2.5">
          <Plus size={18} className="text-ddms-secondary shrink-0" />
          <span>{t('ownerDocuments.uploadTitle')}</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          {t('ownerDocuments.uploadHint')}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-10 w-full rounded-lg bg-muted/40" />
            <Skeleton className="h-10 w-full rounded-lg bg-muted/40" />
            <Skeleton className="h-10 w-full rounded-lg bg-muted/40" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t('ownerDocuments.type')}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-ddms-bg-main px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ddms-secondary/40"
                >
                  {types.map((type) => (
                    <option
                      key={type.code}
                      value={type.code}
                      className="bg-ddms-bg-card text-foreground"
                    >
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
                  className="w-full rounded-lg border border-border bg-ddms-bg-main px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ddms-secondary/40"
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
                  className="w-full text-sm text-muted-foreground rounded-lg border border-border bg-ddms-bg-main px-3 py-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-ddms-secondary/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ddms-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                disabled={uploading || !newFile || !newType}
                onClick={handleUpload}
                className="gap-2 bg-ddms-secondary text-ddms-primary-dark hover:bg-ddms-secondary/90 font-semibold px-5"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {existingTypes.has(newType)
                  ? t('ownerDocuments.replace')
                  : t('ownerDocuments.upload')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
