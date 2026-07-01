import { User } from 'lucide-react';

interface OwnerInfo {
  FullName: string;
  Email: string;
  Phone: string;
  LicenseNumber: string;
  Address: string;
}

interface OwnerInfoSectionProps {
  ownerInfo: OwnerInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const inputClass =
  'w-full bg-[#060D17] border-none rounded px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/50 transition-all placeholder:text-gray-500';

const labelClass = 'text-[13px] font-bold text-gray-300';

const OwnerInfoSection = ({ ownerInfo, onChange }: OwnerInfoSectionProps) => (
  <div className="bg-[#0D1C33] rounded-lg p-6 shadow-xl">
    <h2 className="text-[16px] font-bold text-[#00F0FF] mb-5 flex items-center gap-2 uppercase tracking-wide">
      <User size={18} /> THÔNG TIN CHỦ SỞ HỮU
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2">
        <label className={labelClass}>Họ và Tên</label>
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
        <label className={labelClass}>Email liên lạc</label>
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
        <label className={labelClass}>Số điện thoại</label>
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
        <label className={labelClass}>Số CCCD / Hộ chiếu</label>
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
      <div className="md:col-span-2 space-y-2">
        <label className={labelClass}>Địa chỉ liên lạc</label>
        <input
          required
          type="text"
          name="Address"
          value={ownerInfo.Address}
          onChange={onChange}
          className={inputClass}
          placeholder="Số nhà, Tên đường, Quận/Huyện, Thành phố..."
        />
      </div>
    </div>
  </div>
);

export default OwnerInfoSection;
