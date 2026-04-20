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
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all hover:shadow-md active:scale-95"
      style={{
        borderColor: '#c1c1c1',
        color: '#222222',
        backgroundColor: '#ffffff',
      }}
      aria-label="Toggle language"
    >
      <Globe size={16} />
      <span>{language === 'VN' ? 'VI' : 'EN'}</span>
      <span className="h-4 w-px" style={{ backgroundColor: '#c1c1c1' }} />
      <span className="text-xs" style={{ color: '#6a6a6a' }}>
        {language === 'VN' ? 'English' : 'Tiếng Việt'}
      </span>
    </button>
  );
}
