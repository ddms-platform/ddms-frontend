import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TranslationToggle from '@/components/shared/translation-toggle';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface NavLink {
  label: string;
  href: string;
}

interface GlobalHeaderProps {
  /** Navigation links (anchors or routes) */
  navLinks?: NavLink[];
  /** Show sign-in button (default: true) */
  showAuth?: boolean;
  /** Make header transparent (for hero overlay) */
  transparent?: boolean;
}

export default function GlobalHeader({
  navLinks,
  showAuth = true,
  transparent = false,
}: GlobalHeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: transparent ? 'transparent' : '#0A192F',
        boxShadow: transparent ? 'none' : '0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="DDMS" className="h-10 w-auto" />
        </Link>

        {/* Nav Links */}
        {navLinks && navLinks.length > 0 && (
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-[#00F0FF]"
                style={{ color: '#ecf0ff' }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <TranslationToggle />
          {showAuth && (
            <Button variant="cyan" size="action" asChild>
              <Link to="/sign-in">{t('home.nav.signIn')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
