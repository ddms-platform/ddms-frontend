import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, Bell } from 'lucide-react';
import ProfileAvatar from './components/profile-avatar';
import ProfileInfo from './components/profile-info';
import ChangePassword from './components/change-password';
import ProfileNotifications from './components/profile-notifications';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'info';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      {/* Page Title */}
      <h1
        className="mb-6 text-[28px] font-bold leading-[1.43] text-foreground"
        style={{ letterSpacing: '-0.44px' }}
      >
        {t('profile.title', 'Tài khoản')}
      </h1>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer bg-transparent whitespace-nowrap ${
            currentTab === 'info'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User size={16} />
          {t('profile.tabs.info', 'Thông tin cá nhân')}
        </button>

        <button
          onClick={() => setTab('password')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer bg-transparent whitespace-nowrap ${
            currentTab === 'password'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock size={16} />
          {t('profile.tabs.password', 'Đổi mật khẩu')}
        </button>

        <button
          onClick={() => setTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer bg-transparent whitespace-nowrap ${
            currentTab === 'notifications'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell size={16} />
          {t('profile.tabs.notifications', 'Thông báo')}
        </button>
      </div>

      {/* Tab Content */}
      {currentTab === 'info' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Avatar Card */}
          <div
            className="rounded-2xl p-6 sm:p-8"
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
        </div>
      )}

      {currentTab === 'password' && (
        <div className="animate-in fade-in duration-200">
          <ChangePassword />
        </div>
      )}

      {currentTab === 'notifications' && (
        <div className="animate-in fade-in duration-200">
          <ProfileNotifications />
        </div>
      )}
    </div>
  );
}
