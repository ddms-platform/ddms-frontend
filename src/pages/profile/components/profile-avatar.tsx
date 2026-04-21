import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';

export default function ProfileAvatar() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Mock user initials
  const initials = 'NT';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        <div
          className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: '#f2f2f2',
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          }}
        >
          {avatar ? (
            <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-bold" style={{ color: '#6a6a6a' }}>
              {initials}
            </span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all hover:scale-110"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#ffffff',
            boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
          }}
        >
          <Camera size={16} style={{ color: '#222222' }} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Name & Email */}
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: '#222222', letterSpacing: '-0.44px' }}>
          Nguyễn Tuấn
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#6a6a6a' }}>
          tuan.nguyen@example.com
        </p>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
        style={{ borderColor: '#c1c1c1', color: '#222222' }}
      >
        {t('profile.uploadAvatar')}
      </button>
    </div>
  );
}
