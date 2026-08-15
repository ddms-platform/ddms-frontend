import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Sparkles, Info } from 'lucide-react';
import {
  cleanVesselName,
  hasInvalidVesselChars,
  getSuggestedVesselSuffixes,
  getVesselNamingExample,
} from '@/lib/vessel-naming';
import AiVesselNameModal from '@/components/ai/AiVesselNameModal';
import type { IBoatType } from '@/services/system-service';

interface BoatBasicInfoSectionProps {
  name: string;
  type: string;
  maxPassengers: string;
  boatTypes: IBoatType[];
  errors: Record<string, string>;
  onNameChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onMaxPassengersChange: (v: string) => void;
}

const inputStyle = {
  backgroundColor: 'var(--ddms-bg-main)',
  borderColor: 'var(--border)',
  color: 'var(--foreground)',
};

const BoatBasicInfoSection = ({
  name,
  type,
  maxPassengers,
  boatTypes,
  errors,
  onNameChange,
  onTypeChange,
  onMaxPassengersChange,
}: BoatBasicInfoSectionProps) => {
  const { t, i18n } = useTranslation();
  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const suggestedSuffixes = getSuggestedVesselSuffixes(type);
  const hasInvalidChars = hasInvalidVesselChars(name);

  const handleAppendSuffix = (suffix: string) => {
    const current = cleanVesselName(name);
    if (!current) {
      onNameChange(suffix);
    } else if (!current.includes(suffix)) {
      onNameChange(`${current} ${suffix}`);
    }
  };

  const handleNameBlur = () => {
    if (name) {
      onNameChange(cleanVesselName(name));
    }
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: 'var(--ddms-bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <h2 className="text-base font-semibold text-foreground">
        {t('ownerBoats.form.basic.title')}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('ownerBoats.form.basic.name')} *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="flex items-center gap-1 rounded-md bg-linear-to-r from-ddms-secondary/20 to-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-ddms-secondary hover:from-ddms-secondary/30 hover:to-blue-500/30 transition-all cursor-pointer select-none active:scale-95 border border-ddms-secondary/30"
              >
                <Sparkles
                  size={12}
                  className="animate-pulse text-ddms-secondary"
                />
                <span>
                  {t(
                    'ownerRegistration.vessel.aiSuggestBtn',
                    'AI Gợi ý tên ✨',
                  )}
                </span>
              </button>
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
                  {getVesselNamingExample(type)}
                </strong>
              </p>
            </div>
          )}

          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={handleNameBlur}
            placeholder={t('ownerBoats.form.basic.namePlaceholder')}
            style={{
              ...inputStyle,
              borderColor:
                errors.name || hasInvalidChars ? '#EF4444' : 'var(--border)',
            }}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
          {!errors.name && hasInvalidChars && (
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
            {name && (
              <button
                type="button"
                onClick={() => onNameChange(cleanVesselName(name))}
                className="ml-auto text-[11px] text-muted-foreground hover:text-ddms-secondary transition-colors underline cursor-pointer"
              >
                {t('ownerRegistration.vessel.formatNow', 'IN HOA chuẩn')}
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t('ownerBoats.form.basic.type')} *
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-11 w-full rounded-lg border px-4 text-sm outline-none"
            style={inputStyle}
          >
            {boatTypes.map((bt) => {
              const localizedName = t(`ownerBoats.types.${bt.code}`);
              const displayName =
                localizedName && !localizedName.startsWith('ownerBoats.types.')
                  ? localizedName
                  : i18n.language === 'en'
                    ? bt.nameEn
                    : bt.nameVi;
              return (
                <option
                  key={bt.code}
                  value={bt.code}
                  className="bg-ddms-bg-card text-foreground"
                >
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t('ownerBoats.form.basic.capacity')} *
          </label>
          <Input
            type="number"
            value={maxPassengers}
            onChange={(e) => onMaxPassengersChange(e.target.value)}
            placeholder={t('ownerBoats.form.basic.capacityPlaceholder')}
            style={{
              ...inputStyle,
              borderColor: errors.maxPassengers ? '#EF4444' : 'var(--border)',
            }}
          />
          {errors.maxPassengers && (
            <p className="mt-1 text-xs text-red-400">{errors.maxPassengers}</p>
          )}
        </div>
      </div>

      <AiVesselNameModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        vesselType={type}
        vesselTypeName={boatTypes.find((bt) => bt.code === type)?.nameVi}
        currentName={name}
        onSelectName={onNameChange}
      />
    </div>
  );
};

export default BoatBasicInfoSection;
