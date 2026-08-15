import { FileText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  CertificateFormItem,
  CertificateTypeItem,
} from '@/services/certificateService';
import DateInput from '@/components/ui/date-input';
import { todayIso } from '@/lib/date-format';
import {
  dateInputClass,
  dropzoneClass,
  fieldStyle,
  labelClass,
  optionClass,
  selectClass,
} from './form-styles';

interface CertificateUploadRowProps {
  certificate: CertificateFormItem;
  index: number;
  canRemove: boolean;
  types: CertificateTypeItem[];
  onChange: (
    field: keyof CertificateFormItem,
    value: string | File | null,
  ) => void;
  onRemove: () => void;
}

export default function CertificateUploadRow({
  certificate,
  index,
  canRemove,
  types,
  onChange,
  onRemove,
}: CertificateUploadRowProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const typeLabel = (item: CertificateTypeItem) =>
    isEn ? item.nameEn : item.nameVi;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-foreground/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('ownerRegistration.certificates.rowLabel', { index: index + 1 })}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground transition-colors hover:text-destructive"
            aria-label={t('ownerRegistration.certificates.remove')}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            {t('ownerRegistration.certificates.type')} *
          </label>
          <select
            required
            value={certificate.certificateType}
            onChange={(e) => onChange('certificateType', e.target.value)}
            className={selectClass}
            style={fieldStyle}
          >
            {types.map((type) => (
              <option key={type.code} value={type.code} className={optionClass}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.certificates.expiryDate')} *
          </label>
          <DateInput
            required
            min={todayIso()}
            value={certificate.expiryDate}
            onChange={(iso) => onChange('expiryDate', iso)}
            className={dateInputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {t('ownerRegistration.certificates.file')} *
        </label>
        {certificate.file ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-ddms-bg-main p-3 text-sm text-foreground">
            <FileText size={16} className="shrink-0 text-ddms-secondary" />
            <span className="flex-1 truncate">{certificate.file.name}</span>
            <button
              type="button"
              onClick={() => onChange('file', null)}
              className="text-muted-foreground transition-colors hover:text-destructive"
              aria-label={t('ownerRegistration.certificates.remove')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <label className={`${dropzoneClass} cursor-pointer px-4 py-6`}>
            <FileText
              size={26}
              className="mb-2 text-ddms-secondary/60 transition-transform group-hover:scale-110"
            />
            <span className="text-sm text-foreground">
              {t('ownerRegistration.certificates.uploadHint')}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF, JPG, PNG
            </span>
            <input
              required
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onChange('file', file);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
