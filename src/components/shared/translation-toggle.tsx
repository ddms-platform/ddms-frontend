import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import useLanguage from '@/contexts/LanguageContext';

export default function TranslationToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectLanguage = (lang: 'VN' | 'EN') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0 text-base font-semibold select-none header-link"
        aria-label="Select language"
      >
        <span>{language === 'VN' ? 'VI' : 'EN'}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl py-1 shadow-xl border animate-in fade-in slide-in-from-top-2 duration-150 z-50"
          style={{
            backgroundColor: 'var(--ddms-bg-header)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            onClick={() => selectLanguage('VN')}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors hover:bg-white/10 text-left cursor-pointer border-none bg-transparent ${
              language === 'VN'
                ? 'text-ddms-secondary font-bold'
                : 'text-slate-200'
            }`}
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => selectLanguage('EN')}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-xs md:text-sm font-semibold transition-colors hover:bg-white/10 text-left cursor-pointer border-none bg-transparent ${
              language === 'EN'
                ? 'text-ddms-secondary font-bold'
                : 'text-slate-200'
            }`}
          >
            English
          </button>
        </div>
      )}

      <style>{`
        .header-link {
          color: inherit;
          opacity: 0.95;
          transition: all 0.2s ease;
        }
        .header-link:hover {
          color: var(--ddms-secondary) !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
