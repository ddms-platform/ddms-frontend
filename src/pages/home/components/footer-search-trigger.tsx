import useLanguage from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';

export default function FooterSearchTrigger() {
  const { language } = useLanguage();

  const handleOpenSearchModal = () => {
    window.location.hash = '#searchOverlay';
  };

  return (
    <section className="py-20 bg-transparent relative z-10 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6">
        <button
          onClick={handleOpenSearchModal}
          className="max-w-4xl w-full mx-auto relative flex items-center bg-ddms-bg-card border border-border hover:border-ddms-secondary rounded-full h-19 pl-16 pr-8 text-left transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer group"
        >
          {/* Cyan Search Icon on the left */}
          <Search
            size={24}
            className="absolute left-7 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-10 text-ddms-secondary"
          />
          <span
            className="text-xl font-normal text-muted-foreground group-hover:text-foreground transition-colors duration-300"
            style={{
              letterSpacing: '-0.2px',
            }}
          >
            {language === 'VN' ? 'Tìm kiếm tour...' : 'Search tours...'}
          </span>
        </button>
      </div>
    </section>
  );
}
