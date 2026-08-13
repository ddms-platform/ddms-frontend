import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalHeader from '@/components/layouts/global-header';
import GlobalFooter from '@/components/layouts/global-footer';

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Mỗi href phải khớp id của một section có thật trên trang chủ.
  const navLinks = isHome
    ? [
        { label: t('home.nav.experience'), href: '#experience' },
        { label: t('home.nav.tours'), href: '#tours' },
        { label: t('home.nav.forOwners'), href: '#cta' },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-ddms-bg-main">
      <GlobalHeader navLinks={navLinks} transparent={isHome} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {location.pathname !== '/inbox' && <GlobalFooter />}
    </div>
  );
}
