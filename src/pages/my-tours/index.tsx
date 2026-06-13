import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase, Loader2, RefreshCw } from 'lucide-react';
import { routeName } from '@/constants/route-name';
import { bookingService } from '@/services/bookingService';
import BookingCard, {
  type Booking,
  type BookingStatus,
} from './components/booking-card';

type TabType = 'ALL' | BookingStatus;

export default function DashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (e: any) {
      console.error('Failed to load user bookings:', e);
      setError(e.message || 'Không thể tải danh sách tour đã đặt.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'ALL') return true;
    return booking.status === activeTab;
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: 'ALL', label: t('dashboard.tabs.all') },
    { id: 'PENDING', label: t('dashboard.tabs.pending', 'Chờ thanh toán') },
    { id: 'UPCOMING', label: t('dashboard.tabs.upcoming') },
    { id: 'COMPLETED', label: t('dashboard.tabs.completed') },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: '#ffffff' }}
          >
            {t('dashboard.title')}
          </h1>
          <p className="mt-2 text-base" style={{ color: '#ecf0ff' }}>
            {t('dashboard.welcome')}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backgroundColor: '#112240',
            color: '#ffffff',
          }}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#00F0FF]" />
            <p className="mt-3 text-sm text-gray-400">
              Đang tải danh sách đặt tour...
            </p>
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.2)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
            }}
          >
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all bg-rose-600 hover:bg-rose-500"
            >
              Thử lại
            </button>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancelSuccess={fetchBookings}
            />
          ))
        ) : (
          /* Empty State */
          <div
            className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              backgroundColor: '#112240',
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: '#0d1b36' }}
            >
              <Briefcase size={28} style={{ color: '#ecf0ff' }} />
            </div>
            <h3 className="mt-4 text-lg font-bold" style={{ color: '#ffffff' }}>
              {t('dashboard.emptyTitle')}
            </h3>
            <p
              className="mt-2 max-w-sm text-sm leading-relaxed"
              style={{ color: '#ecf0ff' }}
            >
              {t('dashboard.emptyDescription')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={routeName.tours}
                className="rounded-xl px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#00F0FF', color: '#0A192F' }}
              >
                {t('dashboard.exploreBtn')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
