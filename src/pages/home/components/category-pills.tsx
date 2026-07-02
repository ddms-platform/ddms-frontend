import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  { icon: '🚢', key: 'cruise' },
  { icon: '🌅', key: 'sunset' },
  { icon: '🎉', key: 'party' },
  { icon: '👨‍👩‍👧‍👦', key: 'family' },
  { icon: '📸', key: 'sightseeing' },
  { icon: '🍽️', key: 'dinner' },
];

export default function CategoryPills() {
  const { t } = useTranslation();

  return (
    <section className="border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-ddms-bg-card/50 text-foreground hover:bg-ddms-secondary/10 hover:text-ddms-secondary hover:border-ddms-secondary/30 px-5 py-2.5 text-sm font-medium transition-all hover:shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <span className="text-lg">{cat.icon}</span>
              {t(`home.categories.${cat.key}`)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
