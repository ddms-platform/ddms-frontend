import { Globe } from 'lucide-react';
import useLanguage from '@/contexts/LanguageContext';

export default function TranslationToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'VN' ? 'EN' : 'VN');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all hover:shadow-md active:scale-95 text-foreground"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--ddms-bg-card)',
      }}
      aria-label="Toggle language"
    >
      <Globe size={16} />
      <span>{language === 'VN' ? 'VI' : 'EN'}</span>
      <span className="h-4 w-px" style={{ backgroundColor: 'var(--border)' }} />
      <span className="text-xs text-foreground/80">
        {language === 'VN' ? 'English' : 'Tiếng Việt'}
      </span>
    </button>
  );
}
