import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  tourService,
  type OwnerScheduleListItem,
  type OwnerTourListItem,
} from '@/services/tourService';
import { localDateToIso } from '@/lib/date-format';
import {
  ownerDocumentService,
  type OwnerDocumentsOverviewResponse,
} from '@/services/ownerDocumentService';
import { toast } from 'sonner';
import CancelBookingModal from './components/CancelBookingModal';
import CreateScheduleModal from './components/CreateScheduleModal';
import RecentBookingsTable from './components/RecentBookingsTable';
import DashboardCharts from './components/DashboardCharts';
import ScheduleCalendar from './components/ScheduleCalendar';
import OwnerTourList from './components/OwnerTourList';
import DayScheduleModal from './components/DayScheduleModal';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8'];

const isSuccessResponse = (res: any) =>
  res?.code === 0 || res?.isSuccess === true;

const OwnerToursPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [ownerTours, setOwnerTours] = useState<OwnerTourListItem[]>([]);
  const [ownerToursFailed, setOwnerToursFailed] = useState(false);
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [docOverview, setDocOverview] =
    useState<OwnerDocumentsOverviewResponse | null>(null);
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

      if (isSuccessResponse(res)) {
        // Refresh dashboard data
        const refreshData = await tourService.getToursDashboardRecentBookings();
        if (isSuccessResponse(refreshData)) {
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
      let toursFailed = false;
      try {
        const [
          statsRes,
          schedulesRes,
          bookingsRes,
          resourcesRes,
          toursRes,
          overviewRes,
        ] = await Promise.all([
          tourService.getToursDashboardStats(),
          tourService.getToursDashboardSchedules(currentMonth, currentYear),
          tourService.getToursDashboardRecentBookings(),
          tourService.getToursDashboardResources(),
          // Danh sach tour khong duoc lam sap ca trang, nhung loi phai hien ro
          // thay vi bao "chua co tour nao".
          tourService.getToursDashboardTours().catch((err) => {
            console.error('Failed to load owner tours', err);
            toursFailed = true;
            return null;
          }),
          ownerDocumentService.getOverview().catch(() => null),
        ]);

        setOwnerToursFailed(toursFailed);

        setDocOverview(overviewRes);

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

        const toursData = extractData(toursRes);
        if (Array.isArray(toursData)) setOwnerTours(toursData);

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

  const isLocked = Boolean(docOverview?.isLocked);

  const selectedDaySchedules = useMemo<OwnerScheduleListItem[]>(() => {
    if (!selectedDateIso) return [];
    return schedules.filter(
      (s) => localDateToIso(new Date(s.startTime)) === selectedDateIso,
    );
  }, [schedules, selectedDateIso]);

  /** Mở form tạo lịch với ngày đã chọn sẵn từ ô ngày trên lịch. */
  const handleCreateForDate = (dateIso: string) => {
    if (isLocked) {
      toast.error(t('ownerTours.calendar.createScheduleLocked'));
      return;
    }

    setScheduleDate(dateIso);
    setScheduleEndDate(dateIso);
    setSelectedDateIso(null);
    setShowCreateModal(true);
  };

  /**
   * Bấm vào một lịch trình để xem tour hiện ra sao với khách. Tour chưa được
   * duyệt chưa có trang công khai nên báo rõ thay vì điều hướng vào trang 404.
   */
  const handleScheduleClick = (schedule: any) => {
    if (!schedule?.tourId) {
      toast.info(t('ownerTours.calendar.tourDetailUnavailable'));
      return;
    }

    if ((schedule.tourStatus || '').toLowerCase() !== 'active') {
      toast.info(t('ownerTours.tourList.notPublicHint'));
      return;
    }

    navigate(`/tours/${schedule.tourId}`);
  };

  const handleCreateSchedule = async () => {
    if (isLocked) {
      if (docOverview?.isPendingReview) {
        toast.warning(
          'Hồ sơ pháp lý của bạn đang chờ Ban quản trị xét duyệt. Chức năng tạo lịch trình tour sẽ mở lại sau khi được Admin phê duyệt.',
        );
      } else {
        toast.error(
          'Tài khoản của bạn đã quá hạn nộp giấy tờ pháp lý. Chức năng tạo lịch trình tour đang tạm khóa!',
        );
      }
      return;
    }

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

      if (isSuccessResponse(res)) {
        setShowCreateModal(false);
        setScheduleDate('');
        setScheduleTime('');
        setScheduleEndDate('');
        setScheduleEndTime('');
        setSelectedTourId('');
        toast.success(
          t('ownerTours.createModal.createSuccess', 'Lịch trình đã được tạo!'),
        );

        // re-fetch schedules + tour list (so cac chi so lich trinh khong bi cu)
        const [schedulesRes, toursRes] = await Promise.all([
          tourService.getToursDashboardSchedules(currentMonth, currentYear),
          tourService.getToursDashboardTours().catch(() => null),
        ]);
        if (isSuccessResponse(schedulesRes)) setSchedules(schedulesRes.result);
        if (toursRes && isSuccessResponse(toursRes)) {
          setOwnerTours(toursRes.result);
        }
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

          {/* Registered Tours Card Skeleton */}
          <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-40 rounded-lg" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
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
          {isLocked && (
            <div
              className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                docOverview?.isPendingReview
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    docOverview?.isPendingReview
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">
                    {docOverview?.isPendingReview
                      ? 'Hồ sơ pháp lý đang chờ Ban quản trị phê duyệt'
                      : 'Chức năng tạo lịch trình tour đang bị tạm khóa'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {docOverview?.isPendingReview
                      ? 'Bạn đã nộp đầy đủ giấy tờ. Hệ thống sẽ tự động mở khóa tạo tour ngay sau khi được Admin phê duyệt.'
                      : 'Hồ sơ pháp lý của bạn chưa hoàn tất và đã quá thời hạn nộp. Vui lòng tải lên giấy tờ để gửi Admin xét duyệt và mở khóa.'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={
                  docOverview?.isPendingReview ? 'default' : 'destructive'
                }
                className="cursor-pointer shrink-0 rounded-xl font-bold"
                asChild
              >
                <Link to="/owner/documents">Xem hồ sơ giấy tờ &rarr;</Link>
              </Button>
            </div>
          )}

          <DashboardCharts stats={stats} />

          <OwnerTourList tours={ownerTours} loadFailed={ownerToursFailed} />

          <ScheduleCalendar
            schedules={schedules}
            currentDate={currentDate}
            currentMonth={currentMonth}
            currentYear={currentYear}
            viewMode={viewMode}
            isLocked={isLocked}
            onViewModeChange={setViewMode}
            onCreateClick={() => {
              if (isLocked) {
                toast.error(
                  'Tài khoản của bạn đã quá hạn nộp giấy tờ pháp lý. Chức năng tạo lịch trình tour đang tạm khóa!',
                );
                return;
              }
              setShowCreateModal(true);
            }}
            onScheduleClick={handleScheduleClick}
            onDayClick={setSelectedDateIso}
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

      <DayScheduleModal
        open={selectedDateIso !== null}
        dateIso={selectedDateIso}
        schedules={selectedDaySchedules}
        isLocked={isLocked}
        onClose={() => setSelectedDateIso(null)}
        onCreate={handleCreateForDate}
        onScheduleClick={handleScheduleClick}
      />

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
          const tours = resources.find((b) => b.id === id)?.tours || [];
          setSelectedTourId(tours[0]?.id ?? '');
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
