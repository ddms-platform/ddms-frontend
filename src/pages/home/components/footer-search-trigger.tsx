import useLanguage from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';

export default function FooterSearchTrigger() {
  const { language } = useLanguage();

  const handleOpenSearchModal = () => {
    window.location.hash = '#searchOverlay';
  };

  return (
    <section className="py-20 bg-background relative z-10 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <button
          onClick={handleOpenSearchModal}
          className="max-w-4xl w-full mx-auto relative flex items-center bg-[#002547] hover:bg-[#002d54] border border-white/10 rounded-full h-19 pl-16 pr-8 text-left transition-all duration-300 shadow-lg cursor-pointer group"
        >
          {/* Cyan Search Icon on the left */}
          <Search
            size={24}
            className="absolute left-7 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-10 text-[#00f0ff]"
          />
          <span
            className="text-xl font-light text-white/70 group-hover:text-[#00f0ff] transition-colors duration-300"
            style={{
              letterSpacing: '-0.2px',
            }}
          >
            {language === 'VN' ? 'Tìm kiếm' : 'Search'}
          </span>
        </button>
      </div>
    </section>
  );
}
