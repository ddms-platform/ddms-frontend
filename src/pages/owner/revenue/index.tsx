import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { billingService } from '@/services/billingService';
import MetricCard from './components/MetricCard';
import RevenueChart from './components/RevenueChart';
import RevenueDetailTabs from './components/RevenueDetailTabs';
import PaymentModal from './components/PaymentModal';
import { useFinancialSummary } from './hooks/use-financial-summary';
import { Skeleton } from '@/components/ui/skeleton';

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

export default function OwnerRevenueDashboard() {
  useTranslation();
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

  const { summary, loading, refresh } = useFinancialSummary({
    onPaymentReceived: (data) => {
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
    },
  });

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
      <div className="min-h-screen bg-ddms-bg-owner p-6 lg:p-8 space-y-8 animate-pulse text-foreground">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-ddms-bg-card border border-border shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* Sub-breakdown rows skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-ddms-bg-card border border-border rounded-xl flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="p-4 bg-ddms-bg-card border border-border rounded-xl flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="p-4 bg-ddms-bg-card border border-border rounded-xl flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="bg-ddms-bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>

        {/* Detail Tabs Skeleton */}
        <div className="bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-sm space-y-4">
          <div className="flex border-b border-border bg-muted/40 p-2 gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
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
    <div className="min-h-screen bg-ddms-bg-owner p-6 lg:p-8 font-sans text-foreground">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Quản lý Doanh thu & Thanh toán
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi chi tiết doanh thu tour, hoa hồng hệ thống và thanh toán
            các dịch vụ bến cảng, bảo trì qua cổng PayOS.
          </p>
        </div>
        <Button
          onClick={refresh}
          variant="outline"
          className="border-border hover:bg-muted text-foreground self-start md:self-auto gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới dữ liệu
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          label="Doanh thu đặt Tour"
          value={formatVND(summary?.totalBookingRevenue || 0)}
          valueColor="text-emerald-600 dark:text-emerald-400"
          topIcon={TrendingUp}
          topIconColor="text-emerald-600 dark:text-emerald-400"
          topIconBg="bg-emerald-500/10"
          bgIcon={DollarSign}
          bgIconColor="text-emerald-500/5"
          footer={
            <p className="text-[10px] text-muted-foreground mt-2">
              Tổng giá trị đơn đặt tour thành công
            </p>
          }
        />

        <MetricCard
          label="Tổng phải chi trả"
          value={formatVND(summary?.totalOwed || 0)}
          valueColor="text-ddms-secondary"
          topIcon={CreditCard}
          topIconColor="text-ddms-secondary"
          topIconBg="bg-ddms-secondary/10"
          bgIcon={CreditCard}
          bgIconColor="text-ddms-secondary/5"
          footer={
            <div className="flex gap-2 text-[10px] text-muted-foreground mt-2">
              <span>Hoa hồng + Bảo trì + Thuê bến</span>
            </div>
          }
        />

        <MetricCard
          label="Đã thanh toán"
          value={formatVND(summary?.totalPaid || 0)}
          valueColor="text-blue-600 dark:text-blue-400"
          topIcon={CheckCircle2}
          topIconColor="text-blue-600 dark:text-blue-400"
          topIconBg="bg-blue-500/10"
          bgIcon={CheckCircle2}
          bgIconColor="text-blue-500/5"
          footer={
            <p className="text-[10px] text-muted-foreground mt-2">
              Tổng số tiền đã nộp về hệ thống
            </p>
          }
        />

        <MetricCard
          variant="highlight"
          label="Dư nợ còn lại"
          labelColor="text-ddms-secondary"
          value={formatVND(summary?.remainingBalance || 0)}
          valueColor="text-amber-600 dark:text-amber-400"
          topIcon={AlertCircle}
          topIconColor="text-amber-600 dark:text-amber-400"
          topIconBg="bg-amber-500/10"
          footer={
            summary && summary.remainingBalance > 0 ? (
              <Button
                onClick={handleOpenPayModal}
                className="w-full bg-ddms-secondary hover:bg-ddms-secondary/90 text-white font-bold border-none transition-all cursor-pointer text-xs"
              >
                Thanh toán ngay <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 w-full justify-center py-1">
                ĐÃ HOÀN TẤT NỢ
              </Badge>
            )
          }
        />
      </div>

      {/* Sub-breakdown of fees info row */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-ddms-bg-card border border-border rounded-xl flex items-center justify-between text-sm shadow-sm">
            <span className="text-muted-foreground">
              1. Hoa hồng đại lý (8%):
            </span>
            <span className="font-semibold text-foreground">
              {formatVND(summary.commissionOwed)}
            </span>
          </div>
          <div className="p-4 bg-ddms-bg-card border border-border rounded-xl flex items-center justify-between text-sm shadow-sm">
            <span className="text-muted-foreground">
              2. Phí dịch vụ bảo trì:
            </span>
            <span className="font-semibold text-foreground">
              {formatVND(summary.maintenanceOwed)}
            </span>
          </div>
          <div className="p-4 bg-ddms-bg-card border border-border rounded-xl flex items-center justify-between text-sm shadow-sm">
            <span className="text-muted-foreground">
              3. Phí thuê bến đỗ (5tr/tháng):
            </span>
            <span className="font-semibold text-foreground">
              {formatVND(summary.dockRentalOwed)}
            </span>
          </div>
        </div>
      )}

      <RevenueChart data={chartData} formatVND={formatVND} />

      <RevenueDetailTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summary={summary}
        formatVND={formatVND}
      />

      {/* Local Webhook simulation helper card */}
      <div className="mt-8 p-6 rounded-2xl bg-muted/50 border border-border shadow-inner">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-ddms-secondary" /> Hướng dẫn Test
          Webhook trong môi trường Local
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Vì PayOS chạy môi trường cloud không thể gọi trực tiếp webhook về
          localhost, bạn có thể mô phỏng một thanh toán PayOS thành công bằng
          cách chạy lệnh CURL sau để gửi trực tiếp thông tin thanh toán đã được
          xác nhận về API backend. SignalR sẽ ngay lập tức nhận diện và cập nhật
          giao diện thời gian thực.
        </p>

        {summary &&
        summary.paymentHistory.some((p) => p.status === 'pending') ? (
          <div>
            <p className="text-xs font-bold text-ddms-secondary mb-2">
              Lệnh CURL test cho giao dịch đang chờ của bạn:
            </p>
            <div className="p-3 bg-muted/80 rounded-xl font-mono text-[10px] text-emerald-600 dark:text-emerald-400 border border-border overflow-x-auto whitespace-pre">
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
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
              Lưu ý: Đối với việc test cục bộ không có chữ ký thật từ PayOS, bạn
              cần tắt xác thực hoặc mô phỏng tại webhook controller hoặc đảm bảo
              rằng webhook payload chạy đúng với orderCode trùng khớp.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            (Bấm vào nút "Thanh toán ngay" để tạo một giao dịch chờ thanh toán,
            lệnh CURL kiểm thử sẽ xuất hiện ở đây để hỗ trợ bạn test).
          </p>
        )}
      </div>

      {summary && (
        <PaymentModal
          open={showPayModal}
          onClose={() => setShowPayModal(false)}
          summary={summary}
          formatVND={formatVND}
          payStep={payStep}
          paying={paying}
          payment={{
            orderCode: createdOrderCode,
            checkoutUrl: createdCheckoutUrl,
            amount: createdAmount,
            bin: createdBin,
            accountNumber: createdAccountNumber,
            accountName: createdAccountName,
            description: createdDescription,
          }}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
}
