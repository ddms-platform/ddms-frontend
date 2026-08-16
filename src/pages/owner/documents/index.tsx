import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Plus,
  ExternalLink,
  RefreshCw,
  Loader2,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ArrowDown,
  Trash2,
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
  type OwnerDocumentsOverviewResponse,
} from '@/services/ownerDocumentService';
import DateInput from '@/components/ui/date-input';

export interface UploadRow {
  id: string;
  documentType: string;
  expiryDate: string;
  file: File | null;
}
import { formatDisplayDate, todayIso } from '@/lib/date-format';

const DEFAULT_OWNER_DOC_TYPES: CertificateTypeItem[] = [
  {
    code: 'national_id',
    nameVi: 'CCCD / Hộ chiếu',
    nameEn: 'National ID / Passport',
    description:
      'Căn cước công dân hoặc Hộ chiếu còn hiệu lực của người đại diện theo pháp luật / chủ tàu.',
    scope: 'owner',
    isActive: true,
  },
  {
    code: 'transport_license',
    nameVi: 'Giấy phép hoạt động vận tải',
    nameEn: 'Transport operation license',
    description:
      'Giấy phép kinh doanh vận tải hành khách đường thủy nội địa do Sở GTVT cấp.',
    scope: 'owner',
    isActive: true,
  },
  {
    code: 'business_registration',
    nameVi: 'Giấy chứng nhận ĐKDN',
    nameEn: 'Business registration certificate',
    description: 'Giấy chứng nhận đăng ký doanh nghiệp / Hộ kinh doanh cá thể.',
    scope: 'owner',
    isActive: true,
  },
  {
    code: 'residence_proof',
    nameVi: 'Giấy tờ cư trú',
    nameEn: 'Proof of residence',
    description:
      'Giấy xác nhận thông tin về cư trú (CT07/CT08) hoặc đăng ký tạm trú hợp pháp.',
    scope: 'owner',
    isActive: true,
  },
  {
    code: 'authorization_letter',
    nameVi: 'Giấy ủy quyền',
    nameEn: 'Authorization letter',
    description:
      'Văn bản ủy quyền đại diện thực hiện thủ tục đăng ký vận hành (nếu áp dụng).',
    scope: 'owner',
    isActive: true,
  },
];

export default function OwnerDocumentsPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const formRef = useRef<HTMLDivElement>(null);

  const [overview, setOverview] =
    useState<OwnerDocumentsOverviewResponse | null>(null);
  const [documents, setDocuments] = useState<OwnerDocumentListItem[]>([]);
  const [types, setTypes] = useState<CertificateTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const allDocTypes = useMemo(() => {
    if (types.length > 0) return types;
    return DEFAULT_OWNER_DOC_TYPES;
  }, [types]);

  const [rows, setRows] = useState<UploadRow[]>([
    {
      id: 'row-1',
      documentType: 'national_id',
      expiryDate: '',
      file: null,
    },
  ]);

  const typeDesc = useCallback(
    (code: string) => {
      const found = allDocTypes.find((item) => item.code === code);
      return found?.description || '';
    },
    [allDocTypes],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewData, typeList] = await Promise.all([
        ownerDocumentService.getOverview().catch(() => null),
        certificateService
          .getTypes('owner')
          .catch(() => [] as CertificateTypeItem[]),
      ]);
      if (overviewData) {
        setOverview(overviewData);
        setDocuments(overviewData.documents || []);
      } else {
        const fallbackDocs = await ownerDocumentService
          .list()
          .catch(() => [] as OwnerDocumentListItem[]);
        setDocuments(fallbackDocs || []);
      }
      const fetchedTypes =
        typeList && typeList.length > 0 ? typeList : DEFAULT_OWNER_DOC_TYPES;
      setTypes(fetchedTypes);
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

  const docMap = useMemo(() => {
    const map = new Map<string, OwnerDocumentListItem>();
    documents.forEach((d) => map.set(d.documentType, d));
    return map;
  }, [documents]);

  const missingList = useMemo(() => {
    return allDocTypes.filter((t) => !docMap.has(t.code));
  }, [allDocTypes, docMap]);

  const handleAddRow = (preferredType?: string) => {
    const chosenType =
      preferredType ||
      missingList.find((m) => !rows.some((r) => r.documentType === m.code))
        ?.code ||
      allDocTypes.find((t) => !rows.some((r) => r.documentType === t.code))
        ?.code ||
      allDocTypes[0]?.code ||
      'national_id';

    const newRowId =
      'row-' +
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 6);
    setRows((prev) => [
      ...prev,
      {
        id: newRowId,
        documentType: chosenType,
        expiryDate: '',
        file: null,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'row-' + Date.now().toString(36),
            documentType: allDocTypes[0]?.code || 'national_id',
            expiryDate: '',
            file: null,
          },
        ];
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const handleRowChange = (
    id: string,
    field: keyof UploadRow,
    value: string | File | null,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddAllMissing = () => {
    if (missingList.length === 0) return;
    const newRows: UploadRow[] = missingList.map((m, idx) => ({
      id: `row-missing-${idx}-${Date.now()}`,
      documentType: m.code,
      expiryDate: '',
      file: null,
    }));
    setRows(newRows);
    toast.info(t('ownerDocuments.filledAllMissing'));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const selectTypeAndScroll = (typeCode: string) => {
    setRows((prev) => {
      const existingIndex = prev.findIndex((r) => r.documentType === typeCode);
      if (existingIndex >= 0) {
        return prev;
      }
      const emptyRowIndex = prev.findIndex((r) => r.file === null);
      if (emptyRowIndex >= 0) {
        const updated = [...prev];
        updated[emptyRowIndex] = {
          ...updated[emptyRowIndex],
          documentType: typeCode,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id:
            'row-' +
            Date.now().toString(36) +
            '-' +
            Math.random().toString(36).substring(2, 6),
          documentType: typeCode,
          expiryDate: '',
          file: null,
        },
      ];
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleUploadAll = async () => {
    const validRows = rows.filter((r) => r.file !== null);
    if (validRows.length === 0) {
      toast.error(t('ownerDocuments.pleaseSelectFile'));
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setUploadProgress({ current: i + 1, total: validRows.length });
      try {
        await ownerDocumentService.uploadOrReplace(
          row.documentType,
          row.file!,
          row.expiryDate || undefined,
        );
        successCount++;
      } catch {
        failCount++;
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (successCount > 0) {
      toast.success(
        t('ownerDocuments.uploadMultipleSuccess', { count: successCount }),
      );
      setRows([
        {
          id: 'row-' + Date.now().toString(36),
          documentType: allDocTypes[0]?.code || 'national_id',
          expiryDate: '',
          file: null,
        },
      ]);
      await fetchData();
    }

    if (failCount > 0) {
      toast.error(
        t('ownerDocuments.uploadMultipleError', { count: failCount }),
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t('ownerDocuments.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t('ownerDocuments.subtitle')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted self-start sm:self-auto rounded-xl px-4 py-2 cursor-pointer"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('ownerDocuments.refresh')}
        </Button>
      </div>

      {/* Smart Deadline / Compliance Status Banner */}
      {!loading && overview && (
        <>
          {overview.isApproved || overview.isCompleted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 shrink-0 mt-0.5 shadow-xs">
                <CheckCircle2 size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {t('ownerDocuments.allCompletedTitle')}
                </h3>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 font-medium">
                  {t('ownerDocuments.allCompletedSubtitle')}
                </p>
              </div>
            </div>
          ) : overview.isRejected ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/95 dark:border-rose-900/50 dark:bg-rose-950/40 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 shrink-0 mt-0.5 shadow-xs">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                    {t(
                      'ownerDocuments.rejectedTitle',
                      'Hồ sơ pháp lý có giấy tờ bị từ chối xét duyệt',
                    )}
                  </h3>
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 dark:bg-rose-900/60 dark:text-rose-200 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800 w-fit">
                    ✕ {t('ownerDocuments.rejectedBadge', 'Bị từ chối')}
                  </span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-200/90 font-medium leading-relaxed">
                  {t(
                    'ownerDocuments.rejectedNotice',
                    'Ban quản trị DDMS đã từ chối hồ sơ pháp lý của bạn và yêu cầu cập nhật lại giấy tờ. Vui lòng kiểm tra lý do từ chối ở danh mục bên dưới và tải lên lại tệp hợp lệ để gửi Admin xét duyệt.',
                  )}
                </p>
              </div>
            </div>
          ) : overview.isPendingReview ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/95 dark:border-blue-900/50 dark:bg-blue-950/40 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0 mt-0.5 shadow-xs">
                <Clock size={22} />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">
                    {t(
                      'ownerDocuments.pendingReviewTitle',
                      'Hồ sơ pháp lý đang chờ Ban quản trị DDMS xét duyệt',
                    )}
                  </h3>
                  <span className="text-xs font-bold text-blue-800 bg-blue-100 dark:bg-blue-900/60 dark:text-blue-200 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 w-fit">
                    ⏳{' '}
                    {t('ownerDocuments.pendingReviewBadge', 'Chờ Admin duyệt')}
                  </span>
                </div>
                <p className="text-xs text-blue-800/90 dark:text-blue-200/90 font-medium leading-relaxed">
                  {overview.isLocked
                    ? t(
                        'ownerDocuments.pendingReviewLockedNotice',
                        'Bạn đã nộp đầy đủ các giấy tờ pháp lý. Ban quản trị đang tiến hành thẩm định. Sau khi được duyệt, tất cả tính năng thương mại (tạo tour, quản lý tàu, rút tiền) sẽ được tự động mở khóa hoàn toàn.',
                      )
                    : t(
                        'ownerDocuments.pendingReviewNotice',
                        'Bạn đã nộp đầy đủ các giấy tờ pháp lý. Ban quản trị đang tiến hành kiểm duyệt hồ sơ của bạn.',
                      )}
                </p>
              </div>
            </div>
          ) : overview.isExpired ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/95 dark:border-rose-900/50 dark:bg-rose-950/40 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 shrink-0 mt-0.5 shadow-xs">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                  {t('ownerDocuments.expiredTitle')}
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-200/90 font-medium leading-relaxed">
                  {t('ownerDocuments.expiredSubtitle', {
                    date: formatDisplayDate(overview.uploadDeadline),
                  })}
                </p>

                {/* Missing Documents List with quick click */}
                {missingList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-rose-800 dark:text-rose-300 font-semibold block">
                      {t('ownerDocuments.missingRequired')}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {missingList.map((docType) => (
                        <button
                          key={docType.code}
                          type="button"
                          onClick={() => selectTypeAndScroll(docType.code)}
                          className="rounded-lg bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                          title="Bấm để tải lên loại giấy tờ này"
                        >
                          <AlertTriangle size={12} />
                          {isEn ? docType.nameEn : docType.nameVi}
                          <ArrowDown size={11} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/95 dark:border-amber-900/50 dark:bg-amber-950/40 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 shrink-0 mt-0.5 shadow-xs">
                <Clock size={22} />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    {t('ownerDocuments.deadlineTitle')}
                  </h3>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-200 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 w-fit">
                    {t('ownerDocuments.deadlineRemaining', {
                      days: overview.daysRemaining,
                      hours: overview.hoursRemaining,
                      date: formatDisplayDate(overview.uploadDeadline),
                    })}
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-200/90 font-medium">
                  {t('ownerDocuments.deadlineNotice')}
                </p>

                {/* Missing Documents List with quick click */}
                {missingList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block">
                      {t('ownerDocuments.missingRequired')}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {missingList.map((docType) => (
                        <button
                          key={docType.code}
                          type="button"
                          onClick={() => selectTypeAndScroll(docType.code)}
                          className="rounded-lg bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                          title="Bấm để tải lên loại giấy tờ này"
                        >
                          <AlertTriangle size={12} />
                          {isEn ? docType.nameEn : docType.nameVi}
                          <ArrowDown size={11} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Comprehensive Legal Documents Checklist */}
      <div className="bg-ddms-bg-card rounded-2xl border border-border p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
              <FileCheck size={20} className="text-ddms-secondary shrink-0" />
              <span>{t('ownerDocuments.checklistTitle')}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {t('ownerDocuments.checklistSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-muted-foreground">Tiến độ hoàn tất:</span>
            <span className="px-3 py-1 rounded-full bg-ddms-secondary/15 text-ddms-secondary font-bold">
              {documents.length} / {allDocTypes.length} giấy tờ (
              {allDocTypes.length > 0
                ? Math.round((documents.length / allDocTypes.length) * 100)
                : 0}
              %)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 pt-2">
            <Skeleton className="h-20 w-full rounded-xl bg-muted/40" />
            <Skeleton className="h-20 w-full rounded-xl bg-muted/40" />
            <Skeleton className="h-20 w-full rounded-xl bg-muted/40" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {allDocTypes.map((docType) => {
              const uploadedDoc = docMap.get(docType.code);
              const isUploaded = Boolean(uploadedDoc);

              return (
                <div
                  key={docType.code}
                  className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isUploaded
                      ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                      : 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                        isUploaded
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isUploaded ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <AlertTriangle size={22} />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">
                          {isEn ? docType.nameEn : docType.nameVi}
                        </h4>

                        {/* Mandatory Badge */}
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                          {t('ownerDocuments.statusRequired')}
                        </span>

                        {/* Upload Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                            uploadedDoc?.adminNote
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                              : isUploaded
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                          }`}
                        >
                          {uploadedDoc?.adminNote ? (
                            <>
                              <AlertTriangle size={12} />
                              Bị từ chối (Cần tải lại)
                            </>
                          ) : isUploaded ? (
                            <>
                              <CheckCircle2 size={12} />
                              {t('ownerDocuments.statusUploaded')}
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} />
                              {t('ownerDocuments.statusMissing')}
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {typeDesc(docType.code)}
                      </p>

                      {/* Expiry or Admin Note if Uploaded */}
                      {uploadedDoc && (
                        <div className="space-y-2 pt-1">
                          {uploadedDoc.adminNote && (
                            <div className="rounded-xl p-2.5 bg-rose-500/10 border border-rose-500/25 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                              <AlertTriangle
                                size={14}
                                className="text-rose-500 shrink-0 mt-0.5"
                              />
                              <div>
                                <span className="font-bold">
                                  Lý do từ chối từ Ban quản trị:
                                </span>{' '}
                                <span>{uploadedDoc.adminNote}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs flex-wrap">
                            {uploadedDoc.expiryDate ? (
                              <span className="text-muted-foreground font-medium flex items-center gap-1">
                                <Clock size={12} />
                                {t('ownerDocuments.expiresOn', {
                                  date: formatDisplayDate(
                                    uploadedDoc.expiryDate,
                                  ),
                                })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-medium">
                                {t('ownerDocuments.noExpiry')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center pt-2 md:pt-0">
                    {uploadedDoc ? (
                      <>
                        <a
                          href={uploadedDoc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-ddms-bg-main hover:bg-muted transition-all text-foreground cursor-pointer shadow-2xs"
                          title={t('ownerDocuments.viewDocument')}
                        >
                          <ExternalLink size={14} />
                          {t('ownerDocuments.viewDocument')}
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => selectTypeAndScroll(docType.code)}
                          className="gap-1.5 text-xs font-semibold rounded-xl px-3.5 py-2 cursor-pointer"
                        >
                          <RefreshCw size={13} />
                          {t('ownerDocuments.replaceDoc')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => selectTypeAndScroll(docType.code)}
                        className="gap-1.5 text-xs font-bold rounded-xl px-4 py-2 cursor-pointer transition-all bg-ddms-secondary text-slate-900 hover:bg-ddms-secondary/90 shadow-xs"
                      >
                        <Upload size={13} />
                        {t('ownerDocuments.uploadNow')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Form Card */}
      <div
        ref={formRef}
        className="bg-ddms-bg-card rounded-2xl border border-border p-6 sm:p-7 shadow-sm space-y-6 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2.5">
              <Plus size={18} className="text-ddms-secondary shrink-0" />
              <span>{t('ownerDocuments.uploadTitle')}</span>
            </h2>
            <p className="text-xs mt-1 text-muted-foreground">
              {overview?.isExpired
                ? t(
                    'ownerDocuments.uploadOverdueHint',
                    'Tài khoản đang bị tạm khóa. Vui lòng tải lên đầy đủ các giấy tờ còn thiếu để gửi Ban quản trị DDMS phê duyệt và mở khóa.',
                  )
                : overview?.isPendingReview
                  ? t(
                      'ownerDocuments.uploadPendingReviewHint',
                      'Hồ sơ của bạn đã được nộp đầy đủ và đang chờ Ban quản trị duyệt. Bạn vẫn có thể tải lên thay thế giấy tờ nếu cần.',
                    )
                  : t('ownerDocuments.uploadHint')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {missingList.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAllMissing}
                className="gap-1.5 text-xs font-semibold rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
              >
                <FileCheck size={14} />
                {t('ownerDocuments.addAllMissing')} ({missingList.length})
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddRow()}
              className="gap-1.5 text-xs font-semibold rounded-xl border-ddms-secondary/30 text-ddms-secondary hover:bg-ddms-secondary/10 cursor-pointer"
            >
              <Plus size={14} />
              {t('ownerDocuments.addRow')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 pt-2">
            <Skeleton className="h-24 w-full rounded-xl bg-muted/40" />
            <Skeleton className="h-24 w-full rounded-xl bg-muted/40" />
          </div>
        ) : (
          <>
            {/* Dynamic Rows List */}
            <div className="space-y-4">
              {rows.map((row, index) => {
                const isReplace = existingTypes.has(row.documentType);
                const isDuplicate =
                  rows.filter((r) => r.documentType === row.documentType)
                    .length > 1;

                return (
                  <div
                    key={row.id}
                    className="p-4 sm:p-5 rounded-xl border border-border/60 bg-ddms-bg-main/60 relative space-y-3 transition-all hover:border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {t('ownerDocuments.docNumber', { index: index + 1 })}
                        </span>
                        {isReplace ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {t('ownerDocuments.replaceLabel')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {t('ownerDocuments.statusMissing')}
                          </span>
                        )}
                        {isDuplicate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {t('ownerDocuments.duplicateTypeWarning')}
                          </span>
                        )}
                      </div>
                      {rows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveRow(row.id)}
                          className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer rounded-lg"
                          title={t('ownerDocuments.removeRow')}
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Select Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('ownerDocuments.type')}
                        </label>
                        <select
                          value={row.documentType}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              'documentType',
                              e.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-border bg-ddms-bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ddms-secondary/40"
                        >
                          {allDocTypes.map((type) => (
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

                      {/* Expiry Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('ownerDocuments.expiryDate')}
                        </label>
                        <DateInput
                          min={todayIso()}
                          value={row.expiryDate}
                          onChange={(val) =>
                            handleRowChange(row.id, 'expiryDate', val)
                          }
                          className="w-full rounded-xl border border-border bg-ddms-bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ddms-secondary/40"
                        />
                      </div>

                      {/* File input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">
                            {t('ownerDocuments.file')}
                          </label>
                          {row.file && (
                            <span className="text-[11px] font-medium text-emerald-400 truncate max-w-45">
                              ✓ {row.file.name}
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              'file',
                              e.target.files?.[0] ?? null,
                            )
                          }
                          className="w-full text-sm text-muted-foreground rounded-xl border border-border bg-ddms-bg-card px-3 py-1.5 file:mr-3 file:rounded-lg file:border-0 file:bg-ddms-secondary/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ddms-secondary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddRow()}
                className="gap-2 text-xs font-bold rounded-xl border-dashed border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer w-full sm:w-auto"
              >
                <Plus size={15} />
                {t('ownerDocuments.addRow')}
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {(() => {
                  const selectedFilesCount = rows.filter(
                    (r) => r.file !== null,
                  ).length;
                  const totalRowsCount = rows.length;

                  return (
                    <Button
                      type="button"
                      disabled={uploading || selectedFilesCount === 0}
                      onClick={handleUploadAll}
                      className="gap-2 bg-ddms-secondary text-slate-900 hover:bg-ddms-secondary/90 font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {uploadProgress
                            ? `${t('ownerDocuments.uploadingCount')} (${uploadProgress.current}/${uploadProgress.total})`
                            : t('ownerDocuments.uploadingCount')}
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          {selectedFilesCount === 0
                            ? t(
                                'ownerDocuments.uploadDefault',
                                'Tải lên giấy tờ',
                              )
                            : selectedFilesCount === totalRowsCount
                              ? t('ownerDocuments.uploadAll', {
                                  count: selectedFilesCount,
                                })
                              : t('ownerDocuments.uploadSelected', {
                                  count: selectedFilesCount,
                                  total: totalRowsCount,
                                })}
                        </>
                      )}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
