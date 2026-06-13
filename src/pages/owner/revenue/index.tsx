import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  TrendingUp,
  Wrench,
  Ship,
  History,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  billingService,
  type FinancialSummary,
} from '@/services/billingService';
import * as signalR from '@microsoft/signalr';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function OwnerRevenueDashboard() {
  useTranslation();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'bookings' | 'commissions' | 'maintenances' | 'docks' | 'history'
  >('bookings');
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStep, setPayStep] = useState<'breakdown' | 'waiting' | 'success'>(
    'breakdown',
  );
  const [createdOrderCode, setCreatedOrderCode] = useState<number | null>(null);
  const [createdCheckoutUrl, setCreatedCheckoutUrl] = useState<string>('');
  const [createdAmount, setCreatedAmount] = useState<number>(0);
  const [createdBin, setCreatedBin] = useState<string>('');
  const [createdAccountNumber, setCreatedAccountNumber] = useState<string>('');
  const [createdAccountName, setCreatedAccountName] = useState<string>('');
  const [createdDescription, setCreatedDescription] = useState<string>('');

  // Fetch summary details
  const fetchSummary = async () => {
    try {
      const data = await billingService.getFinancialSummary();
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to fetch financial summary:', error);
      toast.error(
        error.message || 'Không thể lấy dữ liệu doanh thu & thanh toán',
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    };
    init();

    // Setup SignalR connection
    const token = localStorage.getItem('access_token');
    const hubUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/hub/billing`
      : 'https://localhost:7161/hub/billing';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || '',
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log('SignalR Hub connected successfully to /hub/billing');
      })
      .catch((err) => {
        console.error('SignalR Connection Error: ', err);
      });

    // Listen for live PaymentReceived events
    connection.on(
      'PaymentReceived',
      (data: { paymentId: string; status: string; amount: number }) => {
        console.log('Live PaymentReceived update: ', data);
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold text-emerald-400">
              Thanh toán thành công!
            </span>
            <span>Hệ thống đã nhận được số tiền {formatVND(data.amount)}.</span>
          </div>,
          { duration: 8000 },
        );
        setPayStep('success');
        setCreatedAmount(data.amount);
        fetchSummary(); // Refresh stats instantly
      },
    );

    return () => {
      connection.stop().catch(console.error);
    };
  }, []);

  // Format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleOpenPayModal = () => {
    if (!summary || summary.remainingBalance <= 0) return;
    setCreatedAmount(Math.round(summary.remainingBalance));
    setPayStep('breakdown');
    setShowPayModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!summary || summary.remainingBalance <= 0) return;

    setPaying(true);
    try {
      const result = await billingService.initiatePayment();
      setCreatedOrderCode(result.orderCode);
      setCreatedCheckoutUrl(result.checkoutUrl);
      setCreatedAmount(Math.round(summary.remainingBalance));
      setCreatedBin(result.bin || '');
      setCreatedAccountNumber(result.accountNumber || '');
      setCreatedAccountName(result.accountName || '');
      setCreatedDescription(`Du no chu tau ${result.orderCode}`);
      setPayStep('waiting');

      toast.success('Đã tạo mã QR thanh toán thành công!');
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.message || 'Lỗi khởi tạo cổng thanh toán PayOS');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-6 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">
            Đang tải thông tin tài chính...
          </p>
        </div>
      </div>
    );
  }

  // Prep chart data
  // Aggregate stats by Month/Year
  const getChartData = () => {
    if (!summary) return [];

    // Group monthly billing (Commission + Maintenance + Dock Rental) vs Booking revenue
    const monthsData: {
      [key: string]: { name: string; revenue: number; owed: number };
    } = {};

    // 1. Bookings
    summary.bookings.forEach((b) => {
      const date = new Date(b.bookingDate);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthsData[key]) {
        monthsData[key] = { name: key, revenue: 0, owed: 0 };
      }
      monthsData[key].revenue += b.totalPrice;
      monthsData[key].owed += b.commission;
    });

    // 2. Maintenances
    summary.maintenances.forEach((m) => {
      const date = new Date(m.startTime);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthsData[key]) {
        monthsData[key] = { name: key, revenue: 0, owed: 0 };
      }
      monthsData[key].owed += m.amount;
    });

    // 3. Dock rentals
    summary.dockRentals.forEach((d) => {
      const key = `${d.month}/${d.year}`;
      if (!monthsData[key]) {
        monthsData[key] = { name: key, revenue: 0, owed: 0 };
      }
      monthsData[key].owed += d.amount;
    });

    // Sort keys chronologically
    return Object.keys(monthsData)
      .map((key) => {
        const parts = key.split('/');
        return {
          key,
          year: parseInt(parts[1]),
          month: parseInt(parts[0]),
          ...monthsData[key],
        };
      })
      .sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.month - b.month,
      );
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-[#0B132B] p-6 lg:p-8 font-sans text-slate-100">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Quản lý Doanh thu & Thanh toán
          </h1>
          <p className="text-sm text-slate-400">
            Theo dõi chi tiết doanh thu tour, hoa hồng hệ thống và thanh toán
            các dịch vụ bến cảng, bảo trì qua cổng PayOS.
          </p>
        </div>
        <Button
          onClick={fetchSummary}
          variant="outline"
          className="border-slate-800 hover:bg-slate-800 text-slate-300 self-start md:self-auto gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới dữ liệu
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#111C3A] border border-slate-800/60 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Doanh thu đặt Tour
            </p>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatVND(summary?.totalBookingRevenue || 0)}
          </h2>
          <p className="text-[10px] text-slate-400 mt-2">
            Tổng giá trị đơn đặt tour thành công
          </p>
        </div>

        {/* Card 2: Total Owed */}
        <div className="p-5 rounded-2xl bg-[#111C3A] border border-slate-800/60 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <CreditCard className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng phải chi trả
            </p>
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <CreditCard className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-cyan-400 tracking-tight">
            {formatVND(summary?.totalOwed || 0)}
          </h2>
          <div className="flex gap-2 text-[10px] text-slate-400 mt-2">
            <span>Hoa hồng + Bảo trì + Thuê bến</span>
          </div>
        </div>

        {/* Card 3: Total Paid */}
        <div className="p-5 rounded-2xl bg-[#111C3A] border border-slate-800/60 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="w-24 h-24 text-blue-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Đã thanh toán
            </p>
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-blue-400 tracking-tight">
            {formatVND(summary?.totalPaid || 0)}
          </h2>
          <p className="text-[10px] text-slate-400 mt-2">
            Tổng số tiền đã nộp về hệ thống
          </p>
        </div>

        {/* Card 4: Outstanding Balance (Thanh toán) */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-[#1b1e35] to-[#122340] border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Dư nợ còn lại
            </p>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-amber-400 tracking-tight mb-2">
            {formatVND(summary?.remainingBalance || 0)}
          </h2>
          {summary && summary.remainingBalance > 0 ? (
            <Button
              onClick={handleOpenPayModal}
              className="w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold border-none transition-all cursor-pointer text-xs"
            >
              Thanh toán ngay <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-full justify-center py-1">
              ĐÃ HOÀN TẤT NỢ
            </Badge>
          )}
        </div>
      </div>

      {/* Sub-breakdown of fees info row */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-[#111C3A]/40 border border-slate-800/40 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-400">1. Hoa hồng đại lý (8%):</span>
            <span className="font-semibold text-slate-200">
              {formatVND(summary.commissionOwed)}
            </span>
          </div>
          <div className="p-4 bg-[#111C3A]/40 border border-slate-800/40 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-400">2. Phí dịch vụ bảo trì:</span>
            <span className="font-semibold text-slate-200">
              {formatVND(summary.maintenanceOwed)}
            </span>
          </div>
          <div className="p-4 bg-[#111C3A]/40 border border-slate-800/40 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-400">
              3. Phí thuê bến đỗ (5tr/tháng):
            </span>
            <span className="font-semibold text-slate-200">
              {formatVND(summary.dockRentalOwed)}
            </span>
          </div>
        </div>
      )}

      {/* Chart Block */}
      {chartData.length > 0 && (
        <div className="bg-[#111C3A] rounded-2xl border border-slate-800/60 p-6 mb-8 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
            Xu hướng Tài chính
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOwed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111C3A',
                    borderColor: '#374151',
                    borderRadius: '12px',
                  }}
                  formatter={(value: any) => [formatVND(value as number), '']}
                />
                <Legend />
                <Area
                  name="Doanh thu Tour"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  name="Chi phí hệ thống"
                  type="monotone"
                  dataKey="owed"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorOwed)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail list Tabs */}
      <div className="bg-[#111C3A] rounded-2xl border border-slate-800/60 overflow-hidden shadow-lg">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 overflow-x-auto whitespace-nowrap bg-slate-900/40">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-cyan-500 text-cyan-400 bg-[#111C3A]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-4 h-4" /> Doanh thu Tour
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'commissions'
                ? 'border-cyan-500 text-cyan-400 bg-[#111C3A]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Chi tiết hoa hồng (8%)
          </button>
          <button
            onClick={() => setActiveTab('maintenances')}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'maintenances'
                ? 'border-cyan-500 text-cyan-400 bg-[#111C3A]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" /> Chi tiết phí bảo trì
          </button>
          <button
            onClick={() => setActiveTab('docks')}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'docks'
                ? 'border-cyan-500 text-cyan-400 bg-[#111C3A]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-4 h-4" /> Chi tiết phí bến đỗ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-cyan-500 text-cyan-400 bg-[#111C3A]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Lịch sử thanh toán
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Tab 1: Doanh thu Tour */}
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Mã đơn đặt</th>
                    <th className="py-3 px-4">Tên Tour</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Ngày đặt</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Tổng giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {summary?.bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-slate-500"
                      >
                        Không có doanh thu đặt tour nào.
                      </td>
                    </tr>
                  ) : (
                    summary?.bookings.map((b) => (
                      <tr key={b.bookingId} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                          {b.bookingId.substring(0, 8)}...
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {b.tourName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {b.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(b.bookingDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            className={
                              b.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : b.status === 'paid'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }
                          >
                            {b.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                          {formatVND(b.totalPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Chi tiết hoa hồng */}
          {activeTab === 'commissions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Mã đơn đặt</th>
                    <th className="py-3 px-4">Tên Tour</th>
                    <th className="py-3 px-4 text-right">Tổng giá trị đơn</th>
                    <th className="py-3 px-4 text-right">Tỷ lệ</th>
                    <th className="py-3 px-4 text-right text-cyan-400">
                      Hoa hồng phát sinh
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {summary?.bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-slate-500"
                      >
                        Không có phát sinh phí hoa hồng nào.
                      </td>
                    </tr>
                  ) : (
                    summary?.bookings.map((b) => (
                      <tr key={b.bookingId} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                          {b.bookingId.substring(0, 8)}...
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {b.tourName}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300">
                          {formatVND(b.totalPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          8%
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-cyan-400">
                          {formatVND(b.commission)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Chi tiết phí bảo trì */}
          {activeTab === 'maintenances' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Tên tàu</th>
                    <th className="py-3 px-4">Dịch vụ sửa chữa / bảo trì</th>
                    <th className="py-3 px-4">Bắt đầu</th>
                    <th className="py-3 px-4">Kết thúc</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right text-cyan-400">
                      Chi phí dịch vụ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {summary?.maintenances.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-slate-500"
                      >
                        Chưa có bản ghi bảo trì nào được duyệt tính phí.
                      </td>
                    </tr>
                  ) : (
                    summary?.maintenances.map((m) => (
                      <tr
                        key={m.maintenanceId}
                        className="hover:bg-slate-800/20"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {m.boatName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {m.serviceName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(m.startTime).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(m.endTime).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {m.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-cyan-400">
                          {formatVND(m.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Phí thuê bến đỗ */}
          {activeTab === 'docks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Tên tàu</th>
                    <th className="py-3 px-4">Số đăng ký</th>
                    <th className="py-3 px-4">Tháng hoạt động bến</th>
                    <th className="py-3 px-4 text-right text-cyan-400">
                      Đơn giá thuê / tháng
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {summary?.dockRentals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-10 text-slate-500"
                      >
                        Chưa có bản ghi hoạt động bến nào.
                      </td>
                    </tr>
                  ) : (
                    summary?.dockRentals.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {d.boatName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {d.registrationNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          Tháng {d.month} / {d.year}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-cyan-400">
                          {formatVND(d.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 5: Lịch sử thanh toán */}
          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Mã tham chiếu PayOS</th>
                    <th className="py-3 px-4">Mô tả giao dịch</th>
                    <th className="py-3 px-4">Ngày tạo</th>
                    <th className="py-3 px-4">Ngày thanh toán</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {summary?.paymentHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-slate-500"
                      >
                        Bạn chưa thực hiện giao dịch thanh toán nào.
                      </td>
                    </tr>
                  ) : (
                    summary?.paymentHistory.map((p) => (
                      <tr key={p.paymentId} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                          {p.payosOrderCode}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {p.description}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(p.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleString('vi-VN')
                            : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            className={
                              p.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : p.status === 'cancelled'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }
                          >
                            {p.status === 'paid'
                              ? 'THÀNH CÔNG'
                              : p.status === 'cancelled'
                                ? 'HỦY BỎ'
                                : 'CHỜ THANH TOÁN'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                          {formatVND(p.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Local Webhook simulation helper card */}
      <div className="mt-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-inner">
        <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-cyan-400" /> Hướng dẫn Test
          Webhook trong môi trường Local
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Vì PayOS chạy môi trường cloud không thể gọi trực tiếp webhook về
          localhost, bạn có thể mô phỏng một thanh toán PayOS thành công bằng
          cách chạy lệnh CURL sau để gửi trực tiếp thông tin thanh toán đã được
          xác nhận về API backend. SignalR sẽ ngay lập tức nhận diện và cập nhật
          giao diện thời gian thực.
        </p>

        {summary &&
        summary.paymentHistory.some((p) => p.status === 'pending') ? (
          <div>
            <p className="text-xs font-bold text-cyan-300 mb-2">
              Lệnh CURL test cho giao dịch đang chờ của bạn:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-[10px] text-emerald-400 border border-slate-800 overflow-x-auto whitespace-pre">
              {`curl -X POST "https://localhost:7161/api/owner/billing/webhook" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "00",
    "desc": "success",
    "success": true,
    "data": {
      "orderCode": ${summary.paymentHistory.find((p) => p.status === 'pending')?.payosOrderCode},
      "amount": ${Math.round(summary.paymentHistory.find((p) => p.status === 'pending')?.amount || 0)},
      "description": "Thanh toan test",
      "reference": "TEST_REF_12345",
      "transactionDateTime": "${new Date().toISOString()}",
      "currency": "VND",
      "paymentLinkId": "test_link_id"
    },
    "signature": "test_dummy_signature_will_bypass_on_dev"
  }'`}
            </div>
            <p className="text-[10px] text-amber-500 mt-2">
              Lưu ý: Đối với việc test cục bộ không có chữ ký thật từ PayOS, bạn
              cần tắt xác thực hoặc mô phỏng tại webhook controller hoặc đảm bảo
              rằng webhook payload chạy đúng với orderCode trùng khớp.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            (Bấm vào nút "Thanh toán ngay" để tạo một giao dịch chờ thanh toán,
            lệnh CURL kiểm thử sẽ xuất hiện ở đây để hỗ trợ bạn test).
          </p>
        )}
      </div>

      {/* Payment Breakdown & Checkout Modal */}
      {showPayModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111C3A] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  Thanh toán Dư nợ Hệ thống
                </h3>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xl p-1 hover:bg-slate-800 rounded-lg border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {payStep === 'breakdown' && (
                <div className="space-y-6">
                  {/* Summary Callout */}
                  <div className="p-4 bg-linear-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-800/30 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Số tiền cần thanh toán
                      </p>
                      <h4 className="text-3xl font-black text-amber-400 mt-1">
                        {formatVND(summary.remainingBalance)}
                      </h4>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 py-1 px-3">
                      Dư nợ hiện tại
                    </Badge>
                  </div>

                  {/* Detailed Breakdown */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" /> Chi tiết
                      các khoản phải trả
                    </h5>

                    <div className="border border-slate-800/80 rounded-xl divide-y divide-slate-800/80 overflow-hidden bg-slate-900/20">
                      {/* 1. Commission Owed */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>1. Hoa hồng đại lý (8% doanh thu tour)</span>
                          <span className="text-cyan-400">
                            {formatVND(summary.commissionOwed)}
                          </span>
                        </div>
                        {summary.commissionOwed > 0 ? (
                          <div className="max-h-24 overflow-y-auto pl-4 text-xs text-slate-400 space-y-1.5 scrollbar-thin">
                            {summary.bookings.map((b) => (
                              <div
                                key={b.bookingId}
                                className="flex justify-between"
                              >
                                <span>
                                  • {b.tourName} ({b.customerName})
                                </span>
                                <span className="font-mono">
                                  {formatVND(b.commission)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic pl-4">
                            Không có phát sinh nợ hoa hồng.
                          </p>
                        )}
                      </div>

                      {/* 2. Maintenance Owed */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>2. Phí dịch vụ bảo trì (Đã được duyệt)</span>
                          <span className="text-cyan-400">
                            {formatVND(summary.maintenanceOwed)}
                          </span>
                        </div>
                        {summary.maintenanceOwed > 0 ? (
                          <div className="max-h-24 overflow-y-auto pl-4 text-xs text-slate-400 space-y-1.5 scrollbar-thin">
                            {summary.maintenances.map((m) => (
                              <div
                                key={m.maintenanceId}
                                className="flex justify-between"
                              >
                                <span>
                                  • Tàu {m.boatName} - {m.serviceName}
                                </span>
                                <span className="font-mono">
                                  {formatVND(m.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic pl-4">
                            Không có phí bảo trì nào cần đóng.
                          </p>
                        )}
                      </div>

                      {/* 3. Dock Rental Owed */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>3. Phí thuê bến đỗ (5.000.000 đ / tháng)</span>
                          <span className="text-cyan-400">
                            {formatVND(summary.dockRentalOwed)}
                          </span>
                        </div>
                        {summary.dockRentalOwed > 0 ? (
                          <div className="max-h-24 overflow-y-auto pl-4 text-xs text-slate-400 space-y-1.5 scrollbar-thin">
                            {summary.dockRentals.map((d, index) => (
                              <div key={index} className="flex justify-between">
                                <span>
                                  • Tàu {d.boatName} (Tháng {d.month}/{d.year})
                                </span>
                                <span className="font-mono">
                                  {formatVND(d.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic pl-4">
                            Không có phí thuê bến phát sinh.
                          </p>
                        )}
                      </div>

                      {/* 4. Total Paid */}
                      <div className="p-4 flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                          4. Tổng số tiền đã thanh toán trước đó
                        </span>
                        <span className="font-semibold text-emerald-400">
                          -{formatVND(summary.totalPaid)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setShowPayModal(false)}
                      variant="outline"
                      className="flex-1 border-slate-800 hover:bg-slate-800 text-slate-300"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleConfirmPayment}
                      disabled={paying}
                      className="flex-1 bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold border-none"
                    >
                      {paying
                        ? 'Đang tạo link...'
                        : 'Xác nhận & Thanh toán qua PayOS'}
                    </Button>
                  </div>
                </div>
              )}

              {payStep === 'waiting' && (
                <div className="space-y-6 py-2">
                  {/* Status Indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold animate-pulse">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Đang chờ quét mã thanh toán...
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Column 1: QR Code Image */}
                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-800 shadow-inner min-h-80">
                      {createdBin && createdAccountNumber ? (
                        <div className="space-y-3 text-center">
                          <img
                            src={`https://img.vietqr.io/image/${createdBin}-${createdAccountNumber}-compact.png?amount=${createdAmount}&addInfo=${encodeURIComponent(createdDescription)}&accountName=${encodeURIComponent(createdAccountName)}`}
                            alt="VietQR Payment Code"
                            className="w-full max-w-60 mx-auto rounded-lg shadow-md border border-slate-100"
                          />
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-55 mx-auto">
                            Mở ứng dụng ngân hàng quét mã VietQR để thanh toán
                            nhanh qua Napas247
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-slate-500">
                            Đang tải mã QR...
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Payment Transfer Details */}
                    <div className="bg-[#111C3A]/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 text-sm">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Thông tin chuyển khoản
                        </h4>

                        {/* Bank */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-400">
                            Ngân hàng
                          </span>
                          <span className="font-semibold text-slate-200">
                            MB Bank (TMCP Quân Đội)
                          </span>
                        </div>

                        {/* Account Number */}
                        <div className="flex flex-col gap-0.5 relative group">
                          <span className="text-[11px] text-slate-400">
                            Số tài khoản
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-200 text-base">
                              {createdAccountNumber || '---'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  createdAccountNumber,
                                );
                                toast.success('Đã sao chép số tài khoản!');
                              }}
                              className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
                            >
                              Sao chép
                            </Button>
                          </div>
                        </div>

                        {/* Account Name */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-400">
                            Tên người thụ hưởng
                          </span>
                          <span className="font-bold text-slate-200 uppercase">
                            {createdAccountName || '---'}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-400">
                            Số tiền chuyển
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-amber-400 text-lg">
                              {formatVND(createdAmount)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  createdAmount.toString(),
                                );
                                toast.success('Đã sao chép số tiền!');
                              }}
                              className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
                            >
                              Sao chép
                            </Button>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-400">
                            Nội dung chuyển khoản
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cyan-400 text-sm">
                              {createdDescription || '---'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  createdDescription,
                                );
                                toast.success('Đã sao chép nội dung!');
                              }}
                              className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
                            >
                              Sao chép
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* PayOS link fallback */}
                      <a
                        href={createdCheckoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-450 hover:text-slate-200 transition-colors pt-2 border-t border-slate-800/80"
                      >
                        Mở liên kết PayOS gốc{' '}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Simulated local webhook helper inside popup */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Mô phỏng thanh toán (Chạy local)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const curlCmd = `curl -X POST "http://localhost:5015/api/owner/billing/webhook" -H "Content-Type: application/json" -d '{"code":"00","desc":"success","success":true,"data":{"orderCode":${createdOrderCode},"amount":${createdAmount},"description":"Thanh toan test","reference":"TEST_REF_${createdOrderCode}","transactionDateTime":"${new Date().toISOString()}","currency":"VND","paymentLinkId":"test_link_id"},"signature":"test"}'`;
                          navigator.clipboard.writeText(curlCmd);
                          toast.success('Đã sao chép lệnh CURL test!');
                        }}
                        className="h-6 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-800 border-none bg-transparent"
                      >
                        Sao chép CURL
                      </Button>
                    </div>
                    <div className="font-mono text-[9px] text-emerald-400 overflow-x-auto whitespace-pre max-h-24 scrollbar-thin bg-black/40 p-2 rounded-lg border border-slate-900">
                      {`curl -X POST "http://localhost:5015/api/owner/billing/webhook" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "00",
    "desc": "success",
    "success": true,
    "data": {
      "orderCode": ${createdOrderCode},
      "amount": ${createdAmount},
      "description": "Thanh toan test",
      "reference": "TEST_REF_${createdOrderCode}",
      "transactionDateTime": "${new Date().toISOString()}",
      "currency": "VND",
      "paymentLinkId": "test_link_id"
    },
    "signature": "test"
  }'`}
                    </div>
                  </div>
                </div>
              )}

              {payStep === 'success' && (
                <div className="space-y-6 text-center py-8">
                  {/* Success animation */}
                  <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-emerald-400">
                        Thanh toán Thành công!
                      </h4>
                      <p className="text-sm text-slate-300 mt-1">
                        Hệ thống đã nhận được số tiền{' '}
                        <span className="font-bold text-white">
                          {formatVND(createdAmount)}
                        </span>
                        .
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Dư nợ đã được khấu trừ và tự động cập nhật.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPayModal(false)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-none"
                  >
                    Đóng cửa sổ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
