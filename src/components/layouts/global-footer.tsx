import { useTranslation } from 'react-i18next';
import { Anchor } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function GlobalFooter() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img src={logo} alt="DDMS" className="mb-4 h-10 w-auto" />
            <p className="text-sm leading-relaxed text-foreground/80">
              {t('home.footer.description')}
            </p>
          </div>
          {/* Links */}
          {(['explore', 'support', 'legal'] as const).map((section) => (
            <div key={section}>
              <h4
                className="mb-4 text-sm font-semibold text-foreground"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                {t(`home.footer.${section}.title`)}
              </h4>
              <ul className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-ddms-secondary text-foreground/85"
                    >
                      {t(`home.footer.${section}.link${i}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 border-t pt-6"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-foreground/75">
              © {new Date().getFullYear()} DDMS. {t('home.footer.rights')}
            </p>
            <div className="flex items-center gap-3">
              <Anchor size={16} className="text-foreground/75" />
              <span className="text-sm text-foreground/75">
                {t('home.footer.madeIn')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
