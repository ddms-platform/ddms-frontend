import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';
import logo from '@/assets/logo.png';
import { routeName } from '@/constants/route-name';

export default function GlobalFooter() {
  const { t } = useTranslation();

  const footerSections = [
    {
      key: 'explore',
      title: t('home.footer.explore.title'),
      links: [
        { label: t('home.footer.explore.link1'), to: '/tours?category=cruise' },
        { label: t('home.footer.explore.link2'), to: '/tours?category=sunset' },
        { label: t('home.footer.explore.link3'), to: '/tours?category=family' },
      ],
    },
    {
      key: 'support',
      title: t('home.footer.support.title'),
      links: [
        { label: t('home.footer.support.link1'), to: routeName.help },
        { label: t('home.footer.support.link2'), to: routeName.contact },
        { label: t('home.footer.support.link3'), to: routeName.faqs },
      ],
    },
    {
      key: 'legal',
      title: t('home.footer.legal.title'),
      links: [
        { label: t('home.footer.legal.link1'), to: routeName.terms },
        { label: t('home.footer.legal.link2'), to: routeName.privacy },
        {
          label: t('home.footer.legal.link3'),
          to: routeName.cancellationPolicy,
        },
      ],
    },
  ];

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
          {footerSections.map((section) => (
            <div key={section.key}>
              <h4
                className="mb-4 text-sm font-semibold text-foreground"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors hover:text-ddms-secondary text-foreground/85"
                    >
                      {link.label}
                    </Link>
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
