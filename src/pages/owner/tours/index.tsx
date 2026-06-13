import { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Calendar,
  PieChart as PieChartIcon,
  Plus,
  X,
} from 'lucide-react';

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8'];

const CustomBarChart = ({
  data,
  dataKey,
  color,
  yAxisFormatter,
  valueFormatter,
}: {
  data: any[];
  dataKey: string;
  color: string;
  yAxisFormatter?: (val: number) => string;
  valueFormatter?: (val: number) => string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        Chưa có dữ liệu
      </div>
    );
  }

  const values = data.map((d) => d[dataKey] || 0);
  const maxVal = Math.max(...values, 1);
  const ticks = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  return (
    <div className="relative w-full max-w-112.5 h-70 flex flex-col font-sans select-none custom-chart-container">
      <div className="flex flex-1 relative">
        <div className="w-12.5 flex flex-col justify-between text-[10px] text-slate-400 pr-2 select-none h-50 mt-2.5 text-right">
          {ticks.map((tick, i) => (
            <div key={i} className="h-0 flex items-center justify-end">
              {yAxisFormatter ? yAxisFormatter(tick) : Math.round(tick)}
            </div>
          ))}
        </div>

        <div className="flex-1 border-l border-b border-slate-700/80 flex items-end justify-around px-2 pb-1 relative h-50 mt-2.5">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1">
            <div className="border-t border-slate-800/40 w-full h-0"></div>
            <div className="border-t border-slate-800/40 w-full h-0"></div>
            <div className="border-t border-slate-800/40 w-full h-0"></div>
            <div className="h-0 w-full"></div>
          </div>

          {data.map((item, index) => {
            const val = item[dataKey] || 0;
            const pct = (val / maxVal) * 100;
            return (
              <div
                key={index}
                className="group relative flex flex-col items-center flex-1 mx-2 max-w-10 h-full justify-end cursor-pointer z-10"
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const container = e.currentTarget.closest(
                    '.custom-chart-container',
                  );
                  const containerRect = container?.getBoundingClientRect();
                  if (containerRect) {
                    setTooltipPos({
                      x: rect.left - containerRect.left + rect.width / 2,
                      y: rect.top - containerRect.top - 10,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  style={{ height: `${pct}%`, backgroundImage: color }}
                  className="w-full rounded-t transition-all duration-300 group-hover:brightness-125 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex pl-12.5 justify-around text-[10px] text-slate-400 pt-2 select-none px-2 min-h-12 items-start">
        {data.map((item, index) => {
          const name = item.tourName || '';
          return (
            <div
              key={index}
              className="text-center flex-1 mx-1 text-[10px] leading-tight wrap-break-word line-clamp-3"
              title={name}
            >
              {name}
            </div>
          );
        })}
      </div>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded py-1.5 px-3 z-50 shadow-xl pointer-events-none whitespace-nowrap"
        >
          <div className="font-semibold text-slate-300 text-[10px] mb-0.5">
            {data[hoveredIndex].tourName}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundImage: color }}
            ></span>
            <span className="text-slate-400">
              {dataKey === 'bookingsCount' ? 'Lượt đặt: ' : 'Doanh thu: '}
            </span>
            <span className="font-bold">
              {valueFormatter
                ? valueFormatter(data[hoveredIndex][dataKey])
                : data[hoveredIndex][dataKey]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const OwnerToursPage = () => {
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
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/api/owner/tours-dashboard/bookings/${bookingId}/status`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ status, cancelReason: reason }),
        },
      );

      const data = await res.json();
      if (data.isSuccess) {
        // Refresh dashboard data
        const refreshRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/api/owner/tours-dashboard/recent-bookings`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const refreshData = await refreshRes.json();
        if (refreshData.isSuccess) {
          setRecentBookings(refreshData.result);
        }

        // Also refresh stats to update charts
        const statsRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/api/owner/tours-dashboard/stats`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const statsData = await statsRes.json();
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const renderBookingActions = (booking: any) => {
    const status = booking.status.toLowerCase();
    if (status === 'cancelled' || status === 'completed') {
      return (
        <span className="text-xs text-slate-500 font-medium italic">
          Không có hành động
        </span>
      );
    }

    const isPending = status === 'pending' || status === 'chờ xử lý';
    const isUpdating = updatingBookingId === booking.id;

    return (
      <div className="flex justify-end gap-2">
        {isPending ? (
          <>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Xác nhận'}
            </button>
            <button
              disabled={isUpdating}
              onClick={() => {
                setSelectedBookingForCancel(booking);
                setShowCancelModal(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
            >
              Từ chối
            </button>
          </>
        ) : (
          <>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(booking.id, 'completed')}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Hoàn thành'}
            </button>
            <button
              disabled={isUpdating}
              onClick={() => {
                setSelectedBookingForCancel(booking);
                setShowCancelModal(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
            >
              Hủy đơn
            </button>
          </>
        )}
      </div>
    );
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const fetchApi = async (url: string) => {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}${url}`,
            { headers },
          );
          return await res.json();
        };

        const statsRes = await fetchApi('/api/owner/tours-dashboard/stats');
        const schedulesRes = await fetchApi(
          `/api/owner/tours-dashboard/schedules?month=${currentMonth}&year=${currentYear}`,
        );
        const bookingsRes = await fetchApi(
          '/api/owner/tours-dashboard/recent-bookings',
        );
        const resourcesRes = await fetchApi(
          '/api/owner/tours-dashboard/resources',
        );

        if (resourcesRes?.isSuccess) {
          setResources(resourcesRes.result.boats);
          // Default selected boat & tour if available
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSchedule = async () => {
    if (
      !selectedBoatId ||
      !selectedTourId ||
      !scheduleDate ||
      !scheduleTime ||
      !scheduleEndDate ||
      !scheduleEndTime
    ) {
      alert('Vui lòng điền đầy đủ thông tin ngày/giờ bắt đầu và kết thúc!');
      return;
    }
    setIsCreating(true);
    try {
      const token = localStorage.getItem('access_token');
      const startDateTime = `${scheduleDate}T${scheduleTime}:00`;
      const endDateTime = `${scheduleEndDate}T${scheduleEndTime}:00`;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/api/owner/tours-dashboard/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            boatId: selectedBoatId,
            tourId: selectedTourId,
            startTime: startDateTime,
            endTime: endDateTime,
          }),
        },
      );
      const data = await res.json();
      if (data.isSuccess) {
        setShowCreateModal(false);
        setScheduleDate('');
        setScheduleTime('');
        setScheduleEndDate('');
        setScheduleEndTime('');
        setSelectedTourId('');
        // re-fetch schedules
        const schedulesRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/api/owner/tours-dashboard/schedules?month=${currentMonth}&year=${currentYear}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        ).then((r) => r.json());
        if (schedulesRes?.isSuccess) setSchedules(schedulesRes.result);
      } else {
        alert(data.message || 'Lỗi khi tạo lịch trình');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi tạo lịch trình');
    } finally {
      setIsCreating(false);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let startOffset = new Date(currentYear, currentMonth - 1, 1).getDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1; // Convert Sunday(0) to 6, Monday(1) to 0

    // Add empty slots for offset
    for (let i = 0; i < startOffset; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-30 p-2 border-r border-b border-slate-700/50 bg-slate-800/20"
        ></div>,
      );
    }

    const todayDay = currentDate.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const daySchedules = schedules.filter((s) => {
        const d = new Date(s.startTime);
        return d.getDate() === i;
      });

      const isToday = i === todayDay;

      days.push(
        <div
          key={`day-${i}`}
          className={`min-h-[120px] p-2 border-r border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${isToday ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : ''}`}
        >
          <div
            className={`text-sm font-semibold mb-2 ${isToday ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            {i.toString().padStart(2, '0')}
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule, idx) => (
              <div
                key={idx}
                className="text-xs px-2 py-1 rounded bg-cyan-900/40 text-cyan-400 border border-cyan-800 truncate"
                title={`${schedule.tourName} - ${schedule.boatName}`}
              >
                {new Date(schedule.startTime).getHours()}h: {schedule.tourName}{' '}
                ({schedule.boatName})
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return days;
  };

  const renderWeekView = () => {
    // Basic week view: just list schedules for the next 7 days starting from today
    const weekSchedules = schedules
      .filter((s) => {
        const d = new Date(s.startTime);
        return (
          d >= new Date(currentYear, currentMonth - 1, currentDate.getDate()) &&
          d <=
            new Date(currentYear, currentMonth - 1, currentDate.getDate() + 7)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-medium text-cyan-400">
          Lịch trình 7 ngày tới
        </h3>
        {weekSchedules.length === 0 ? (
          <p className="text-slate-400">
            Không có lịch trình nào trong tuần tới.
          </p>
        ) : (
          <div className="grid gap-3">
            {weekSchedules.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 p-3 rounded-lg"
              >
                <div className="text-center min-w-20">
                  <div className="text-sm text-slate-400">
                    {new Date(s.startTime).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                    })}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {new Date(s.startTime).getDate()}
                  </div>
                </div>
                <div className="flex-1 border-l border-slate-600 pl-4">
                  <div className="font-medium text-cyan-400">
                    {s.tourName}{' '}
                    <span className="text-slate-400 text-sm ml-2">
                      ({s.boatName})
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {new Date(s.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -
                    {new Date(s.endTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDayView = () => {
    // Day view: just list schedules for today
    const daySchedules = schedules
      .filter((s) => {
        const d = new Date(s.startTime);
        return d.getDate() === currentDate.getDate();
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-medium text-cyan-400">
          Lịch trình Hôm nay ({currentDate.toLocaleDateString('vi-VN')})
        </h3>
        {daySchedules.length === 0 ? (
          <p className="text-slate-400">
            Không có lịch trình nào trong hôm nay.
          </p>
        ) : (
          <div className="grid gap-3">
            {daySchedules.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 p-3 rounded-lg border-l-4 border-l-cyan-500"
              >
                <div className="text-center min-w-20">
                  <div className="text-lg font-bold text-cyan-400">
                    {new Date(s.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {s.tourName}{' '}
                    <span className="text-slate-400 text-sm ml-2">
                      Tàu: {s.boatName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <span className="px-2 py-1 text-xs rounded bg-cyan-900/50 text-cyan-400 border border-cyan-800">
            ĐÃ THANH TOÁN
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300 border border-slate-600">
            CHỜ XỬ LÝ
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs rounded bg-red-900/50 text-red-400 border border-red-800">
            ĐÃ HỦY
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300 border border-slate-600">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  // Lọc tour theo tàu được chọn
  const availableTours =
    resources.find((b) => b.id === selectedBoatId)?.tours || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MapIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Quản lý Tour
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-cyan-400">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* Dashboard Pie Chart */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <PieChartIcon className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">
                Phân tích Doanh thu & Lượt đặt (Theo Tour)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 overflow-x-auto">
              <div className="flex h-75 flex-col items-center min-w-100">
                <h3 className="text-center text-sm text-slate-400 mb-2">
                  Lượt đặt chỗ (Theo Tour)
                </h3>
                <div className="pt-4 flex justify-center w-full">
                  <CustomBarChart
                    data={stats}
                    dataKey="bookingsCount"
                    color="linear-gradient(180deg, #34d399 0%, #059669 100%)"
                    yAxisFormatter={(val) => String(Math.round(val))}
                    valueFormatter={(val) => `${val} lượt`}
                  />
                </div>
              </div>
              <div className="flex h-75 flex-col items-center min-w-100">
                <h3 className="text-center text-sm text-slate-400 mb-2">
                  Doanh thu VNĐ (Theo Tour)
                </h3>
                <div className="pt-4 flex justify-center w-full">
                  <CustomBarChart
                    data={stats}
                    dataKey="totalRevenue"
                    color="linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)"
                    yAxisFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : String(val)
                    }
                    valueFormatter={(val) =>
                      val.toLocaleString('vi-VN') + ' VNĐ'
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">
                  Lịch Trình Sự Kiện - Tháng {currentMonth}, {currentYear}
                </h2>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="flex bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md ${viewMode === 'month' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    THÁNG
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md ${viewMode === 'week' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    TUẦN
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md ${viewMode === 'day' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    NGÀY
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-1.5 rounded-md font-bold transition-colors shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                >
                  <Plus size={18} />
                  TẠO TOUR
                </button>
              </div>
            </div>

            <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-[#131c31] min-h-100">
              {viewMode === 'month' && (
                <>
                  <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-800/50">
                    {[
                      'Thứ 2',
                      'Thứ 3',
                      'Thứ 4',
                      'Thứ 5',
                      'Thứ 6',
                      'Thứ 7',
                      'Chủ Nhật',
                    ].map((day) => (
                      <div
                        key={day}
                        className="py-3 text-center text-sm font-medium text-slate-300 border-r border-slate-700/50 last:border-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">{renderCalendarDays()}</div>
                </>
              )}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </div>
          </div>

          {/* Recent Bookings Section */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-xl mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Danh sách Đặt chỗ Gần đây
              </h2>
              <a
                href="#"
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                XEM TẤT CẢ <span className="text-lg">→</span>
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 pr-4">MÃ ĐƠN</th>
                    <th className="pb-4 px-4">KHÁCH HÀNG</th>
                    <th className="pb-4 px-4">DỊCH VỤ / TÀU</th>
                    <th className="pb-4 px-4">THỜI GIAN</th>
                    <th className="pb-4 px-4">GIÁ TRỊ</th>
                    <th className="pb-4 px-4">TRẠNG THÁI</th>
                    <th className="pb-4 pl-4 text-right">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-300 divide-y divide-slate-800/50">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-slate-500"
                      >
                        Chưa có lượt đặt nào gần đây.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 pr-4 font-mono text-cyan-400">
                          {booking.bookingId}
                        </td>
                        <td className="py-4 px-4 text-white font-medium">
                          {booking.customerName}
                        </td>
                        <td className="py-4 px-4">
                          <div>{booking.serviceName}</div>
                          <div className="text-xs text-slate-500">
                            Tàu: {booking.boatName}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {new Date(booking.time).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-4 px-4">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(booking.value)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {renderBookingActions(booking)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Tạo Lịch Trình (Tạo Tour) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] w-full max-w-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Tạo Lịch Trình Tour
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setScheduleDate('');
                  setScheduleTime('');
                  setScheduleEndDate('');
                  setScheduleEndTime('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Chọn Tàu
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  value={selectedBoatId}
                  onChange={(e) => {
                    setSelectedBoatId(e.target.value);
                    setSelectedTourId(''); // reset tour when boat changes
                  }}
                >
                  <option value="">-- Chọn tàu của bạn --</option>
                  {resources.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Chọn Tour (Chỉ Tour đã được Admin duyệt)
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  disabled={!selectedBoatId}
                >
                  <option value="">-- Chọn Tour --</option>
                  {availableTours.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {selectedBoatId && availableTours.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Tàu này chưa có Tour nào được Admin duyệt. Hãy đợi duyệt
                    hoặc đăng ký thêm ở Quản lý Tàu.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Ngày diễn ra
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                    value={scheduleDate}
                    onChange={(e) => {
                      setScheduleDate(e.target.value);
                      if (!scheduleEndDate) {
                        setScheduleEndDate(e.target.value);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Giờ xuất phát
                  </label>
                  <input
                    type="time"
                    className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                    value={scheduleEndDate}
                    onChange={(e) => setScheduleEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setScheduleDate('');
                  setScheduleTime('');
                  setScheduleEndDate('');
                  setScheduleEndTime('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={
                  isCreating ||
                  !selectedBoatId ||
                  !selectedTourId ||
                  !scheduleDate ||
                  !scheduleTime ||
                  !scheduleEndDate ||
                  !scheduleEndTime
                }
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 text-white text-sm font-bold rounded-md transition-colors"
              >
                {isCreating ? 'Đang tạo...' : 'Lưu Lịch Trình'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hủy/Từ chối Đơn Hàng */}
      {showCancelModal && selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] w-full max-w-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Hủy / Từ chối Đơn Đặt
              </h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedBookingForCancel(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-3">
                  Bạn đang yêu cầu hủy đơn đặt chỗ **#
                  {selectedBookingForCancel.bookingId}** của khách hàng **
                  {selectedBookingForCancel.customerName}**.
                </p>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Lý do hủy đơn (Bắt buộc)
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors h-24 resize-none"
                  placeholder="Nhập lý do chi tiết..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedBookingForCancel(null);
                  }}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedBookingForCancel.id,
                      'cancelled',
                      cancelReason,
                    )
                  }
                  disabled={!cancelReason.trim() || updatingBookingId !== null}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition-colors text-sm font-bold disabled:opacity-50"
                >
                  Xác nhận Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerToursPage;
