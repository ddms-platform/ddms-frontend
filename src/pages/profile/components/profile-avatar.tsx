import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { AuthServices } from '@/services/auth-service';

export default function ProfileAvatar() {
  const { t } = useTranslation();
  const { user, reloadUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const res = await AuthServices.updateAvatar(file);
        if (res.status === 200) {
          const reader = new FileReader();
          reader.onload = (ev) => setAvatar(ev.target?.result as string);
          reader.readAsDataURL(file);
          await reloadUser();
          toast.success('Tải ảnh lên thành công');
        } else {
          toast.error('Tải ảnh lên thất bại');
        }
      } catch (error) {
        toast.error('Lỗi khi tải ảnh lên');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const name = user?.name || 'User';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const displayAvatar = avatar || user?.avatar_url;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        <div
          className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: '#112240',
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          }}
        >
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold" style={{ color: '#ecf0ff' }}>
              {initials}
            </span>
          )}
        </div>
        <button
          onClick={() => !isUploading && fileInputRef.current?.click()}
          disabled={isUploading}
          className={`absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${isUploading ? 'opacity-50' : ''}`}
          style={{
            backgroundColor: '#0A192F',
            borderColor: '#ffffff',
            boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
          }}
        >
          <Camera size={16} style={{ color: '#ffffff' }} />
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
        <h2
          className="text-xl font-bold"
          style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
        >
          {name}
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
          {user?.email || ''}
        </p>
      </div>

      <Button
        variant="dark-outline"
        size="action"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? 'Đang tải lên...' : t('profile.uploadAvatar')}
      </Button>
    </div>
  );
}
