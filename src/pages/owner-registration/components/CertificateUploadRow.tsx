import { FileText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  CertificateFormItem,
  CertificateTypeItem,
} from '@/services/certificateService';
import DateInput from '@/components/ui/date-input';
import { todayIso } from '@/lib/date-format';

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

const inputClass =
  'w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500';
const labelClass = 'text-[13px] font-bold text-gray-300';

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
    <div className="rounded-lg border border-gray-700/50 bg-[#060D17]/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#00F0FF] uppercase tracking-wide">
          {t('ownerRegistration.certificates.rowLabel', { index: index + 1 })}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label={t('ownerRegistration.certificates.remove')}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.certificates.type')}
          </label>
          <select
            required
            value={certificate.certificateType}
            onChange={(e) => onChange('certificateType', e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all appearance-none cursor-pointer"
          >
            {types.map((type) => (
              <option
                key={type.code}
                className="bg-[#060D17] text-white"
                value={type.code}
              >
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.certificates.expiryDate')}
          </label>
          <DateInput
            required
            min={todayIso()}
            value={certificate.expiryDate}
            onChange={(iso) => onChange('expiryDate', iso)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>
          {t('ownerRegistration.certificates.file')}
        </label>
        {certificate.file ? (
          <div className="flex items-center gap-2 text-[13px] text-gray-300 bg-[#0A1322] p-3 rounded border border-gray-700/50">
            <FileText size={16} className="text-[#00F0FF] shrink-0" />
            <span className="truncate flex-1">{certificate.file.name}</span>
            <button
              type="button"
              onClick={() => onChange('file', null)}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-700/70 hover:border-[#00F0FF]/50 transition-colors cursor-pointer p-6 bg-[#060D17]">
            <FileText className="w-7 h-7 text-gray-400 mb-2" />
            <span className="text-[14px] text-white">
              {t('ownerRegistration.certificates.uploadHint')}
            </span>
            <span className="text-[12px] text-gray-500 mt-1">
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
