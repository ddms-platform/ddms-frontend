import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import BookingCard, { type Booking, type BookingStatus } from './components/booking-card';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '8A9B2C',
    tourId: 1,
    tourTitle_vn: 'Tour Sông Hàn Về Đêm',
    tourTitle_en: 'Han River Night Tour',
    location_vn: 'Sông Hàn, Đà Nẵng',
    location_en: 'Han River, Da Nang',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
    date: '2026-04-25',
    time: '19:00',
    guests: 2,
    totalPrice: 700000,
    status: 'UPCOMING',
    createdAt: '2026-04-21T08:00:00Z',
  },
  {
    id: '5D3E1F',
    tourId: 2,
    tourTitle_vn: 'Tour Vịnh Hạ Long',
    tourTitle_en: 'Ha Long Bay Cruise',
    location_vn: 'Vịnh Hạ Long, Quảng Ninh',
    location_en: 'Ha Long Bay, Quang Ninh',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
    date: '2026-02-14',
    time: '08:00',
    guests: 4,
    totalPrice: 4800000,
    status: 'COMPLETED',
    createdAt: '2026-02-01T10:30:00Z',
  },
  {
    id: '1X2Y3Z',
    tourId: 3,
    tourTitle_vn: 'Phố Cổ Hội An',
    tourTitle_en: 'Hoi An Ancient Town',
    location_vn: 'Hội An, Quảng Nam',
    location_en: 'Hoi An, Quang Nam',
    image: 'https://images.unsplash.com/photo-1549488344-c6a66b96e47d?w=800&q=80',
    date: '2026-03-10',
    time: '15:00',
    guests: 1,
    totalPrice: 500000,
    status: 'CANCELLED',
    createdAt: '2026-03-01T14:20:00Z',
  },
];

type TabType = 'ALL' | BookingStatus;

export default function DashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    if (activeTab === 'ALL') return true;
    return booking.status === activeTab;
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: 'ALL', label: t('dashboard.tabs.all') },
    { id: 'UPCOMING', label: t('dashboard.tabs.upcoming') },
    { id: 'COMPLETED', label: t('dashboard.tabs.completed') },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: '#ffffff' }}>
          {t('dashboard.title')}
        </h1>
        <p className="mt-2 text-base" style={{ color: '#ecf0ff' }}>
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Tabs */}
      <div
        className="mb-6 flex gap-6 overflow-x-auto border-b no-scrollbar"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative shrink-0 pb-3 text-sm font-semibold transition-colors"
              style={{
                color: isActive ? '#ffffff' : '#ecf0ff',
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full"
                  style={{ backgroundColor: '#ffffff' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          /* Empty State */
          <div
            className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#fafafa' }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: '#112240' }}
            >
              <Briefcase size={28} style={{ color: '#ecf0ff' }} />
            </div>
            <h3 className="mt-4 text-lg font-bold" style={{ color: '#ffffff' }}>
              {t('dashboard.emptyTitle')}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
              {t('dashboard.emptyDescription')}
            </p>
            <Link
              to="/tours"
              className="mt-6 rounded-xl px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#00F0FF' }}
            >
              {t('dashboard.exploreBtn')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
