import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center">
        <h1
          className="text-[28px] font-bold leading-[1.43]"
          style={{ color: '#222222', letterSpacing: '-0.44px' }}
        >
          {t('dashboard.title')}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#6a6a6a' }}>
          {t('dashboard.welcome')}
        </p>
      </div>
    </div>
  );
}
