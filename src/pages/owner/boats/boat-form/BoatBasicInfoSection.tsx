import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
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
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.08)',
  color: '#fff',
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

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: '#112240',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
        {t('ownerBoats.form.basic.title')}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-xs font-medium"
            style={{ color: '#ecf0ff' }}
          >
            {t('ownerBoats.form.basic.name')} *
          </label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('ownerBoats.form.basic.namePlaceholder')}
            style={{
              ...inputStyle,
              borderColor: errors.name ? '#EF4444' : 'rgba(255,255,255,0.08)',
            }}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-medium"
            style={{ color: '#ecf0ff' }}
          >
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
                    ? bt.name_en
                    : bt.name_vi;
              return (
                <option key={bt.code} value={bt.code} style={{ color: '#000' }}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-medium"
            style={{ color: '#ecf0ff' }}
          >
            {t('ownerBoats.form.basic.capacity')} *
          </label>
          <Input
            type="number"
            value={maxPassengers}
            onChange={(e) => onMaxPassengersChange(e.target.value)}
            placeholder={t('ownerBoats.form.basic.capacityPlaceholder')}
            style={{
              ...inputStyle,
              borderColor: errors.maxPassengers
                ? '#EF4444'
                : 'rgba(255,255,255,0.08)',
            }}
          />
          {errors.maxPassengers && (
            <p className="mt-1 text-xs text-red-400">{errors.maxPassengers}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoatBasicInfoSection;
