import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SERVICES = [
  {
    icon: '🚢',
    key: 'river_tours',
  },
  {
    icon: '⛵',
    key: 'yacht_charter',
  },
  {
    icon: '🎟️',
    key: 'port_tickets',
  },
  {
    icon: '🏄',
    key: 'water_sports',
  },
  {
    icon: '📅',
    key: 'port_schedule',
  },
];

export default function CategoryPills() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('river_tours');

  return (
    <section className="bg-transparent select-none py-5 border-none">
      <div className="mx-auto max-w-7xl px-6">
        {/* Services Tabs Row */}
        <div className="flex gap-3 md:gap-5 overflow-x-auto pt-2 pb-2 justify-center items-center scrollbar-none">
          {SERVICES.map((svc) => {
            const isActive = activeTab === svc.key;
            const label = t(`home.services.${svc.key}`);
            return (
              <button
                key={svc.key}
                onClick={() => setActiveTab(svc.key)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-3xl border px-5 py-2.75 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-ddms-bg-card text-foreground hover:border-foreground'
                }`}
              >
                <span className="text-lg md:text-xl">{svc.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
