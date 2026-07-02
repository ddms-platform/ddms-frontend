import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalHeader from '@/components/layouts/global-header';
import GlobalFooter from '@/components/layouts/global-footer';

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinks = isHome
    ? [
        { label: t('home.nav.tours'), href: '#tours' },
        { label: t('home.nav.howItWorks'), href: '#how-it-works' },
        { label: t('home.nav.destinations'), href: '#destinations' },
      ]
    : [];

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: '#0A192F' }}
    >
      <GlobalHeader navLinks={navLinks} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {location.pathname !== '/inbox' && <GlobalFooter />}
    </div>
  );
}
