import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon } from 'lucide-react';
import { tourService } from '@/services/tourService';
import { toast } from 'sonner';
import CancelBookingModal from './components/CancelBookingModal';
import CreateScheduleModal from './components/CreateScheduleModal';
import RecentBookingsTable from './components/RecentBookingsTable';
import DashboardCharts from './components/DashboardCharts';
import ScheduleCalendar from './components/ScheduleCalendar';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8'];

const OwnerToursPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Status update states
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<
    any | null
  >(null);
  const [cancelReason, setCancelReason] = useState('');

  const handleUpdateStatus = async (
    bookingId: string,
    status: string,
    reason?: string,
  ) => {
    try {
      setUpdatingBookingId(bookingId);
      const res = await tourService.updateBookingStatus(bookingId, {
        status,
        cancelReason: reason,
      });

      if (res.code === 0) {
        // Refresh dashboard data
        const refreshData = await tourService.getToursDashboardRecentBookings();
        if (refreshData.code === 0) {
          setRecentBookings(refreshData.result);
        }

        // Also refresh stats to update charts
        const statsData = await tourService.getToursDashboardStats();
        if (statsData.code === 0) {
          const parsedStats = statsData.result.map((s: any, index: number) => ({
            ...s,
            fill: COLORS[index % COLORS.length],
            bookingsCount: Number(s.bookingsCount) || 0,
            totalRevenue: Number(s.totalRevenue) || 0,
          }));
          setStats(parsedStats);
        }

        // Hide cancel modal if open
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedBookingForCancel(null);
        toast.success(
          status === 'confirmed'
            ? t(
                'ownerTours.recentBookings.actions.confirmSuccess',
                'Đã xác nhận thành công',
              )
            : status === 'completed'
              ? t(
                  'ownerTours.recentBookings.actions.completeSuccess',
                  'Đã hoàn thành tour',
                )
              : t(
                  'ownerTours.recentBookings.actions.cancelSuccess',
                  'Đã hủy đơn thành công',
                ),
        );
      } else {
        toast.error(res.message || t('common.error', 'Đã xảy ra lỗi'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('common.error', 'Đã xảy ra lỗi'));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      // Set to the 1st of the previous month to avoid day-rollover issues
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      // Set to the 1st of the next month to avoid day-rollover issues
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, schedulesRes, bookingsRes, resourcesRes] =
          await Promise.all([
            tourService.getToursDashboardStats(),
            tourService.getToursDashboardSchedules(currentMonth, currentYear),
            tourService.getToursDashboardRecentBookings(),
            tourService.getToursDashboardResources(),
          ]);

        const extractData = (res: any) => {
          if (!res) return null;
          if (Array.isArray(res)) return res;
          if (res.result !== undefined) return res.result;
          if (res.data !== undefined) return res.data;
          if (res.items !== undefined) return res.items;
          return res;
        };

        const resourcesData = extractData(resourcesRes);
        if (resourcesData && Array.isArray(resourcesData.boats)) {
          setResources(resourcesData.boats);
          if (resourcesData.boats.length > 0) {
            setSelectedBoatId(resourcesData.boats[0].id);
            if (resourcesData.boats[0].tours?.length > 0) {
              setSelectedTourId(resourcesData.boats[0].tours[0].id);
            }
          }
        }

        const statsData = extractData(statsRes);
        if (Array.isArray(statsData)) {
          const parsedStats = statsData.map((s: any, index: number) => ({
            ...s,
            fill: COLORS[index % COLORS.length],
            bookingsCount: Number(s.bookingsCount) || 0,
            totalRevenue: Number(s.totalRevenue) || 0,
          }));
          setStats(parsedStats);
        }

        const schedulesData = extractData(schedulesRes);
        if (Array.isArray(schedulesData)) setSchedules(schedulesData);

        const bookingsData = extractData(bookingsRes);
        if (Array.isArray(bookingsData)) setRecentBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        toast.error(
          t('ownerTours.loadingError', 'Không thể tải dữ liệu Dashboard.'),
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentMonth, currentYear, t]);

  const handleCreateSchedule = async () => {
    if (
      !selectedBoatId ||
      !selectedTourId ||
      !scheduleDate ||
      !scheduleTime ||
      !scheduleEndDate ||
      !scheduleEndTime
    ) {
      toast.error(t('ownerTours.createModal.validationError'));
      return;
    }
    setIsCreating(true);
    try {
      const startDateTime = `${scheduleDate}T${scheduleTime}:00`;
      const endDateTime = `${scheduleEndDate}T${scheduleEndTime}:00`;
      const res = await tourService.createTourSchedule({
        boatId: selectedBoatId,
        tourId: selectedTourId,
        startTime: startDateTime,
        endTime: endDateTime,
      });

      if (res.code === 0) {
        setShowCreateModal(false);
        setScheduleDate('');
        setScheduleTime('');
        setScheduleEndDate('');
        setScheduleEndTime('');
        setSelectedTourId('');
        toast.success(t('ownerTours.createModal.createSuccess'));

        // re-fetch schedules
        const schedulesRes = await tourService.getToursDashboardSchedules(
          currentMonth,
          currentYear,
        );
        if (schedulesRes?.code === 0) setSchedules(schedulesRes.result);
      } else {
        toast.error(res.message || t('ownerTours.createModal.createError'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('ownerTours.createModal.connectionError'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MapIcon className="w-8 h-8 text-ddms-secondary" />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {t('ownerTours.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Charts Card Skeleton */}
          <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-6 w-56" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-4 w-40 mx-auto" />
                <Skeleton className="h-60 w-full rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-40 mx-auto" />
                <Skeleton className="h-60 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Calendar Card Skeleton */}
          <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>

          {/* Table Card Skeleton */}
          <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <DashboardCharts stats={stats} />

          <ScheduleCalendar
            schedules={schedules}
            currentDate={currentDate}
            currentMonth={currentMonth}
            currentYear={currentYear}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateClick={() => setShowCreateModal(true)}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />

          <RecentBookingsTable
            bookings={recentBookings}
            updatingBookingId={updatingBookingId}
            onConfirm={(id) => handleUpdateStatus(id, 'confirmed')}
            onComplete={(id) => handleUpdateStatus(id, 'completed')}
            onOpenCancel={(booking) => {
              setSelectedBookingForCancel(booking);
              setShowCancelModal(true);
            }}
          />
        </>
      )}

      <CreateScheduleModal
        open={showCreateModal}
        boats={resources}
        selectedBoatId={selectedBoatId}
        selectedTourId={selectedTourId}
        scheduleDate={scheduleDate}
        scheduleTime={scheduleTime}
        scheduleEndDate={scheduleEndDate}
        scheduleEndTime={scheduleEndTime}
        isCreating={isCreating}
        onBoatChange={(id) => {
          setSelectedBoatId(id);
          setSelectedTourId('');
        }}
        onTourChange={setSelectedTourId}
        onScheduleDateChange={setScheduleDate}
        onScheduleTimeChange={setScheduleTime}
        onScheduleEndDateChange={setScheduleEndDate}
        onScheduleEndTimeChange={setScheduleEndTime}
        onClose={() => {
          setShowCreateModal(false);
          setScheduleDate('');
          setScheduleTime('');
          setScheduleEndDate('');
          setScheduleEndTime('');
        }}
        onConfirm={handleCreateSchedule}
      />

      <CancelBookingModal
        open={showCancelModal}
        booking={selectedBookingForCancel}
        reason={cancelReason}
        isUpdating={updatingBookingId !== null}
        onReasonChange={setCancelReason}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason('');
          setSelectedBookingForCancel(null);
        }}
        onConfirm={() =>
          selectedBookingForCancel &&
          handleUpdateStatus(
            selectedBookingForCancel.id,
            'cancelled',
            cancelReason,
          )
        }
      />
    </div>
  );
};

export default OwnerToursPage;
