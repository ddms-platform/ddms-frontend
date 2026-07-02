import { useTranslation } from 'react-i18next';
import ProfileAvatar from './components/profile-avatar';
import ProfileInfo from './components/profile-info';
import ChangePassword from './components/change-password';

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Page Title */}
      <h1
        className="mb-8 text-[28px] font-bold leading-[1.43] text-foreground"
        style={{ letterSpacing: '-0.44px' }}
      >
        {t('profile.title')}
      </h1>

      <div className="space-y-8">
        {/* Avatar Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--ddms-bg-card)',
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          }}
        >
          <ProfileAvatar />
        </div>

        {/* Profile Info */}
        <ProfileInfo />

        {/* Change Password */}
        <ChangePassword />
      </div>
    </div>
  );
}
