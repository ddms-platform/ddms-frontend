import { useState, type ReactNode } from 'react';
import {
  Ship,
  Anchor,
  FileImage,
  FileText,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileUploadBox from './FileUploadBox';
import CertificateUploadRow from './CertificateUploadRow';
import SectionCard from './SectionCard';
import DateInput from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { todayIso } from '@/lib/date-format';
import {
  cleanVesselName,
  hasInvalidVesselChars,
  getSuggestedVesselSuffixes,
  getVesselNamingExample,
} from '@/lib/vessel-naming';
import type { IBoatType } from '@/services/system-service';
import type {
  CertificateFormItem,
  CertificateTypeItem,
} from '@/services/certificateService';
import {
  dateInputClass,
  fieldStyle,
  labelClass,
  optionClass,
  selectClass,
} from './form-styles';

export interface VesselFormState {
  Name: string;
  Type: string;
  Length: string;
  Beam: string;
  MaxPassengers: string;
  RegistrationNumber: string;
  MooringType: string;
  ExpectedDockingDate: string;
  ImageFiles: File[];
  Certificates: CertificateFormItem[];
}

interface VesselSectionProps {
  vessel: VesselFormState;
  index: number;
  totalCount: number;
  boatTypes: IBoatType[];
  certificateTypes: CertificateTypeItem[];
  onChange: (field: string, value: any) => void;
  onAddFiles: (field: 'ImageFiles', files: FileList | null) => void;
  onRemoveFile: (field: 'ImageFiles', fileIndex: number) => void;
  onCertificateChange: (
    certIndex: number,
    field: keyof CertificateFormItem,
    value: string | File | null,
  ) => void;
  onAddCertificate: () => void;
  onRemoveCertificate: (certIndex: number) => void;
  onRemoveVessel: () => void;
}

/** Tieu de nho cho tung nhom truong ben trong the du thuyen. */
function SubSection({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Anchor;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-7 border-t border-border pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon size={16} className="text-ddms-secondary" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const VesselSection = ({
  vessel,
  index,
  totalCount,
  boatTypes,
  certificateTypes,
  onChange,
  onAddFiles,
  onRemoveFile,
  onCertificateChange,
  onAddCertificate,
  onRemoveCertificate,
  onRemoveVessel,
}: VesselSectionProps) => {
  const { t } = useTranslation();

  const mooringOptions = [
    {
      value: 'Floating',
      label: t('ownerRegistration.vessel.mooring.floating'),
    },
    { value: 'Fixed', label: t('ownerRegistration.vessel.mooring.fixed') },
  ];

  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const suggestedSuffixes = getSuggestedVesselSuffixes(vessel.Type);
  const hasInvalidChars = hasInvalidVesselChars(vessel.Name);

  const handleAppendSuffix = (suffix: string) => {
    const current = cleanVesselName(vessel.Name);
    if (!current) {
      onChange('Name', suffix);
    } else if (!current.includes(suffix)) {
      onChange('Name', `${current} ${suffix}`);
    }
  };

  const handleNameBlur = () => {
    if (vessel.Name) {
      onChange('Name', cleanVesselName(vessel.Name));
    }
  };

  return (
    <SectionCard
      icon={Ship}
      step={t('ownerRegistration.steps.vessel', { index: index + 1 })}
      title={
        totalCount > 1
          ? t('ownerRegistration.vessel.titleNumbered', { index: index + 1 })
          : t('ownerRegistration.vessel.title')
      }
      description={t('ownerRegistration.vessel.description')}
      action={
        totalCount > 1 && (
          <button
            type="button"
            onClick={onRemoveVessel}
            aria-label={t('ownerRegistration.vessel.remove')}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        )
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('ownerRegistration.vessel.name')} *
            </label>
            {/* Không gợi ý tên ở đây: tên thuyền đã được đăng ký trên giấy tờ
                trước khi chủ thuyền vào khai, phải nhập đúng tên đó thì hồ sơ
                mới khớp với giấy đăng ký. */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNamingGuide(!showNamingGuide)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-ddms-secondary hover:underline cursor-pointer bg-transparent border-none p-0 select-none"
              >
                <Info size={12} />
                <span>
                  {t(
                    'ownerRegistration.vessel.namingConventionBadge',
                    'Chuẩn đặt tên',
                  )}
                </span>
              </button>
            </div>
          </div>

          {showNamingGuide && (
            <div className="mb-2.5 rounded-lg border border-ddms-secondary/30 bg-ddms-secondary/10 p-2.5 text-xs text-foreground/90 space-y-1">
              <p className="font-semibold text-ddms-secondary flex items-center gap-1.5">
                <Info size={13} />
                {t(
                  'ownerRegistration.vessel.namingGuideTitle',
                  'Cấu trúc tên tàu chuẩn:',
                )}
              </p>
              <p className="text-muted-foreground text-[11px]">
                <code>[Tên Thương Hiệu/Tên Riêng]</code> +{' '}
                <code>[Loại Tàu]</code> + <code>[Số Hiệu]</code>
              </p>
              <p className="text-muted-foreground text-[11px]">
                VD:{' '}
                <strong className="text-foreground">
                  {getVesselNamingExample(vessel.Type)}
                </strong>
              </p>
            </div>
          )}

          <Input
            required
            type="text"
            value={vessel.Name}
            onChange={(e) => onChange('Name', e.target.value)}
            onBlur={handleNameBlur}
            style={{
              ...fieldStyle,
              borderColor: hasInvalidChars ? '#EF4444' : undefined,
            }}
            placeholder="SEA MAJESTY"
          />

          {hasInvalidChars && (
            <p className="mt-1 text-[11px] text-red-400">
              {t(
                'ownerRegistration.vessel.invalidCharsWarning',
                'Tên tàu chỉ nên chứa chữ cái, số và dấu gạch ngang (-).',
              )}
            </p>
          )}

          {/* Quick suggested suffixes pills */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">
              {t('ownerRegistration.vessel.quickSuffixes', 'Gợi ý thêm:')}
            </span>
            {suggestedSuffixes.map((suffix) => (
              <button
                key={suffix}
                type="button"
                onClick={() => handleAppendSuffix(suffix)}
                className="rounded-md border border-border bg-ddms-bg-main/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:border-ddms-secondary/50 hover:bg-ddms-secondary/15 hover:text-ddms-secondary transition-colors cursor-pointer select-none active:scale-95"
              >
                + {suffix}
              </button>
            ))}
            {vessel.Name && (
              <button
                type="button"
                onClick={() => onChange('Name', cleanVesselName(vessel.Name))}
                className="ml-auto text-[11px] text-muted-foreground hover:text-ddms-secondary transition-colors underline cursor-pointer"
              >
                {t('ownerRegistration.vessel.formatNow', 'IN HOA chuẩn')}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.vessel.type')} *
          </label>
          <select
            value={vessel.Type}
            onChange={(e) => onChange('Type', e.target.value)}
            className={selectClass}
            style={fieldStyle}
          >
            {boatTypes.length > 0 ? (
              boatTypes.map((bt) => (
                <option key={bt.code} value={bt.code} className={optionClass}>
                  {bt.nameVi}
                </option>
              ))
            ) : (
              <>
                <option value="yacht" className={optionClass}>
                  {t('ownerRegistration.vessel.typeFallback.yacht')}
                </option>
                <option value="catamaran" className={optionClass}>
                  {t('ownerRegistration.vessel.typeFallback.catamaran')}
                </option>
                <option value="speedboat" className={optionClass}>
                  {t('ownerRegistration.vessel.typeFallback.speedboat')}
                </option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            {t(
              'ownerRegistration.vessel.maxPassengers',
              'Sức chứa tối đa (khách)',
            )}{' '}
            *
          </label>
          <Input
            required
            type="number"
            min={1}
            max={1000}
            step="1"
            value={vessel.MaxPassengers}
            onChange={(e) => onChange('MaxPassengers', e.target.value)}
            style={fieldStyle}
            placeholder="50"
          />
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.vessel.length')} *
          </label>
          <Input
            required
            type="number"
            step="0.01"
            value={vessel.Length}
            onChange={(e) => onChange('Length', e.target.value)}
            style={fieldStyle}
            placeholder="24.5"
          />
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.vessel.beam')} *
          </label>
          <Input
            required
            type="number"
            step="0.01"
            value={vessel.Beam}
            onChange={(e) => onChange('Beam', e.target.value)}
            style={fieldStyle}
            placeholder="6.2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            {t('ownerRegistration.vessel.registrationNumber')} *
          </label>
          <Input
            required
            type="text"
            value={vessel.RegistrationNumber}
            onChange={(e) => onChange('RegistrationNumber', e.target.value)}
            style={fieldStyle}
            placeholder="REG-99283-VN"
          />
        </div>
      </div>

      <SubSection
        icon={Anchor}
        title={t('ownerRegistration.vessel.mooring.title')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              {t('ownerRegistration.vessel.mooring.label')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {mooringOptions.map((option) => {
                const active = vessel.MooringType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange('MooringType', option.value)}
                    className={`h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                      active
                        ? 'border-ddms-secondary bg-ddms-secondary/10 text-ddms-secondary'
                        : 'border-border text-muted-foreground hover:border-ddms-secondary/40 hover:text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <details className="group mt-3">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-ddms-secondary hover:underline">
                <Info size={14} />
                {t('ownerRegistration.vessel.mooring.learnMore')}
              </summary>
              <div className="mt-2 space-y-2.5 rounded-xl border border-border bg-foreground/5 p-3.5 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">
                    {t('ownerRegistration.vessel.mooring.floating')}:
                  </strong>{' '}
                  {t('ownerRegistration.vessel.mooring.floatingDesc')}
                </p>
                <p>
                  <strong className="text-foreground">
                    {t('ownerRegistration.vessel.mooring.fixed')}:
                  </strong>{' '}
                  {t('ownerRegistration.vessel.mooring.fixedDesc')}
                </p>
              </div>
            </details>
          </div>

          <div>
            <label className={labelClass}>
              {t('ownerRegistration.vessel.mooring.dockingDate')} *
            </label>
            <DateInput
              required
              min={todayIso()}
              value={vessel.ExpectedDockingDate}
              onChange={(iso) => onChange('ExpectedDockingDate', iso)}
              className={dateInputClass}
            />
          </div>
        </div>
      </SubSection>

      <SubSection
        icon={FileImage}
        title={t('ownerRegistration.vessel.images.title')}
      >
        <FileUploadBox
          files={vessel.ImageFiles}
          accept="image/*"
          icon={FileImage}
          variant="image"
          emptyTitle={t('ownerRegistration.vessel.images.empty')}
          emptyHint={t('ownerRegistration.vessel.images.hint')}
          countLabel={(n) =>
            t('ownerRegistration.vessel.images.count', { count: n })
          }
          addMoreLabel={t('ownerRegistration.vessel.images.addMore')}
          onAdd={(files) => onAddFiles('ImageFiles', files)}
          onRemove={(i) => onRemoveFile('ImageFiles', i)}
        />
      </SubSection>

      <SubSection
        icon={FileText}
        title={t('ownerRegistration.vessel.documents.title')}
        action={
          <button
            type="button"
            onClick={onAddCertificate}
            className="flex items-center gap-1 text-xs font-semibold text-ddms-secondary hover:underline"
          >
            <Plus size={14} />
            {t('ownerRegistration.vessel.documents.add')}
          </button>
        }
      >
        <div className="space-y-4">
          {vessel.Certificates.map((cert, certIndex) => (
            <CertificateUploadRow
              key={certIndex}
              certificate={cert}
              index={certIndex}
              canRemove={vessel.Certificates.length > 1}
              types={certificateTypes}
              onChange={(field, value) =>
                onCertificateChange(certIndex, field, value)
              }
              onRemove={() => onRemoveCertificate(certIndex)}
            />
          ))}
        </div>
      </SubSection>
    </SectionCard>
  );
};

export default VesselSection;
