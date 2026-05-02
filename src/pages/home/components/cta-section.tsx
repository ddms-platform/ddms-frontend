import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  const { t } = useTranslation();

  return (
    <section
      className="py-20"
      style={{
        background: 'linear-gradient(135deg, #112240 0%, #0A192F 50%, #0d2847 100%)',
      }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-bold leading-tight md:text-4xl"
          style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
        >
          {t('home.cta.title')}
        </h2>
        <p className="mt-4 text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {t('home.cta.description')}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="cyan" size="action-lg" className="px-8 text-base" asChild>
            <Link to="/sign-up">{t('home.cta.signUp')}</Link>
          </Button>
          <Button
            variant="dark-outline"
            size="action-lg"
            className="border-2 px-8 text-base"
            style={{ borderColor: '#ffffff' }}
            asChild
          >
            <Link to="/tours">{t('home.cta.explore')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
