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

      if (res.isSuccess) {
        // Refresh dashboard data
        const refreshData = await tourService.getToursDashboardRecentBookings();
        if (refreshData.isSuccess) {
          setRecentBookings(refreshData.result);
        }

        // Also refresh stats to update charts
        const statsData = await tourService.getToursDashboardStats();
        if (statsData.isSuccess) {
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

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

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

        if (resourcesRes?.isSuccess) {
          setResources(resourcesRes.result.boats);
          if (resourcesRes.result.boats.length > 0) {
            setSelectedBoatId(resourcesRes.result.boats[0].id);
            if (resourcesRes.result.boats[0].tours.length > 0) {
              setSelectedTourId(resourcesRes.result.boats[0].tours[0].id);
            }
          }
        }
        if (statsRes?.isSuccess) {
          const parsedStats = statsRes.result.map((s: any, index: number) => ({
            ...s,
            fill: COLORS[index % COLORS.length],
            bookingsCount: Number(s.bookingsCount) || 0,
            totalRevenue: Number(s.totalRevenue) || 0,
          }));
          setStats(parsedStats);
        }
        if (schedulesRes?.isSuccess) setSchedules(schedulesRes.result);
        if (bookingsRes?.isSuccess) setRecentBookings(bookingsRes.result);
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

      if (res.isSuccess) {
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
        if (schedulesRes?.isSuccess) setSchedules(schedulesRes.result);
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
        <MapIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {t('ownerTours.title')}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-cyan-400">
          {t('ownerTours.loadingData')}
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
