import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import useLanguage from '@/contexts/LanguageContext';

const LANGUAGES = [
  { code: 'VN' as const, label: 'Tiếng Việt' },
  { code: 'EN' as const, label: 'English' },
];

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

      {/* Dropdown List — dùng token popover (đục hẳn ở cả hai chế độ) thay vì
          màu cứng cho nền tối, nếu không ở chế độ sáng chữ sẽ chìm vào hero. */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-32 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-xl duration-150">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className={`flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-accent md:text-sm ${
                language === lang.code
                  ? 'font-bold text-ddms-secondary'
                  : 'text-popover-foreground'
              }`}
            >
              {lang.label}
            </button>
          ))}
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
