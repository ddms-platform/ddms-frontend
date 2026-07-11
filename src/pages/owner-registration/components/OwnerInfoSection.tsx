import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OwnerEntityType } from '@/services/certificateService';
import { OWNER_ENTITY_TYPES } from '@/services/certificateService';

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
}

const inputClass =
  'w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500';

const labelClass = 'text-[13px] font-bold text-gray-300';

const OwnerInfoSection = ({ ownerInfo, onChange }: OwnerInfoSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0D1C33] rounded-lg p-6 shadow-xl">
      <h2 className="text-[16px] font-bold text-[#00F0FF] mb-5 flex items-center gap-2 uppercase tracking-wide">
        <User size={18} /> {t('ownerRegistration.ownerInfo.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.fullName')}
          </label>
          <input
            required
            type="text"
            name="FullName"
            value={ownerInfo.FullName}
            onChange={onChange}
            className={inputClass}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.email')}
          </label>
          <input
            required
            type="email"
            name="Email"
            value={ownerInfo.Email}
            onChange={onChange}
            className={inputClass}
            placeholder="owner@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.phone')}
          </label>
          <input
            required
            type="text"
            name="Phone"
            value={ownerInfo.Phone}
            onChange={onChange}
            className={inputClass}
            placeholder="+84 900 000 000"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.licenseNumber')}
          </label>
          <input
            required
            type="text"
            name="LicenseNumber"
            value={ownerInfo.LicenseNumber}
            onChange={onChange}
            className={inputClass}
            placeholder="012345678901"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.entityType')}
          </label>
          <select
            required
            name="EntityType"
            value={ownerInfo.EntityType}
            onChange={onChange}
            style={{ colorScheme: 'dark' }}
            className="w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all appearance-none cursor-pointer"
          >
            {OWNER_ENTITY_TYPES.map((code) => (
              <option
                key={code}
                className="bg-[#060D17] text-white"
                value={code}
              >
                {t(`ownerRegistration.entityTypes.${code}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className={labelClass}>
            {t('ownerRegistration.ownerInfo.address')}
          </label>
          <input
            required
            type="text"
            name="Address"
            value={ownerInfo.Address}
            onChange={onChange}
            className={inputClass}
            placeholder={t('ownerRegistration.ownerInfo.addressPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
};

export default OwnerInfoSection;
