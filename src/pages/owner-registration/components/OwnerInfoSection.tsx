import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import type { OwnerEntityType } from '@/services/certificateService';
import { OWNER_ENTITY_TYPES } from '@/services/certificateService';
import SectionCard from './SectionCard';
import { fieldStyle, labelClass } from './form-styles';

interface OwnerInfo {
  FullName: string;
  Email: string;
  Phone: string;
  LicenseNumber: string;
  Address: string;
  EntityType: OwnerEntityType;
}

interface OwnerInfoSectionProps {
  ownerInfo: OwnerInfo;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onEntityTypeChange: (value: OwnerEntityType) => void;
}

const OwnerInfoSection = ({
  ownerInfo,
  onChange,
  onEntityTypeChange,
}: OwnerInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard
      icon={User}
      step={t('ownerRegistration.steps.owner')}
      title={t('ownerRegistration.ownerInfo.title')}
      description={t('ownerRegistration.ownerInfo.description')}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.fullName')} *
          </label>
          <Input
            required
            type="text"
            name="FullName"
            value={ownerInfo.FullName}
            onChange={onChange}
            style={fieldStyle}
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.email')} *
          </label>
          <Input
            required
            type="email"
            name="Email"
            value={ownerInfo.Email}
            onChange={onChange}
            style={fieldStyle}
            placeholder="owner@example.com"
          />
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.phone')} *
          </label>
          <Input
            required
            type="tel"
            name="Phone"
            value={ownerInfo.Phone}
            onChange={onChange}
            style={fieldStyle}
            placeholder="+84 900 000 000"
          />
        </div>

        <div>
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.licenseNumber')} *
          </label>
          <Input
            required
            type="text"
            name="LicenseNumber"
            value={ownerInfo.LicenseNumber}
            onChange={onChange}
            style={fieldStyle}
            placeholder="012345678901"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.entityType')} *
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {OWNER_ENTITY_TYPES.map((code) => {
              const active = ownerInfo.EntityType === code;
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onEntityTypeChange(code)}
                  className={`h-11 rounded-lg border px-4 text-sm font-medium transition-colors ${
                    active
                      ? 'border-ddms-secondary bg-ddms-secondary/10 text-ddms-secondary'
                      : 'border-border text-muted-foreground hover:border-ddms-secondary/40 hover:text-foreground'
                  }`}
                >
                  {t(`ownerRegistration.entityTypes.${code}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.address')} *
          </label>
          <Input
            required
            type="text"
            name="Address"
            value={ownerInfo.Address}
            onChange={onChange}
            style={fieldStyle}
            placeholder={t('ownerRegistration.ownerInfo.addressPlaceholder')}
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default OwnerInfoSection;
