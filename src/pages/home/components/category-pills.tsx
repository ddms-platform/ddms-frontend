import { useState } from 'react';
import useLanguage from '@/contexts/LanguageContext';

const SERVICES = [
  {
    icon: '🚢',
    key: 'river_tours',
    labelVN: 'Tour Sông Hàn',
    labelEN: 'River Tours',
  },
  {
    icon: '⛵',
    key: 'yacht_charter',
    labelVN: 'Thuê du thuyền riêng',
    labelEN: 'Yacht Charter',
  },
  {
    icon: '🎟️',
    key: 'port_tickets',
    labelVN: 'Đặt vé cảng',
    labelEN: 'Port Tickets',
  },
  {
    icon: '🏄',
    key: 'water_sports',
    labelVN: 'Thể thao nước',
    labelEN: 'Water Sports',
  },
  {
    icon: '📅',
    key: 'port_schedule',
    labelVN: 'Lịch trình cảng',
    labelEN: 'Port Schedule',
  },
];

export default function CategoryPills() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('river_tours');

  return (
    <section className="bg-background select-none py-5 border-none">
      <div className="mx-auto max-w-7xl px-6">
        {/* Services Tabs Row */}
        <div className="flex gap-3 md:gap-5 overflow-x-auto pt-2 pb-2 justify-center items-center scrollbar-none">
          {SERVICES.map((svc) => {
            const isActive = activeTab === svc.key;
            const label = language === 'VN' ? svc.labelVN : svc.labelEN;
            return (
              <button
                key={svc.key}
                onClick={() => setActiveTab(svc.key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border border-ddms-secondary bg-transparent text-ddms-secondary shadow-md scale-[1.03]'
                    : 'border border-transparent bg-transparent text-slate-200 hover:text-ddms-secondary'
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
