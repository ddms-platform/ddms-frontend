import type { LucideIcon } from 'lucide-react';
import { Ship, TrendingUp, Wrench, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FinancialSummary } from '@/services/billingService';

export type RevenueTabKey =
  | 'bookings'
  | 'commissions'
  | 'maintenances'
  | 'docks'
  | 'history';

interface RevenueDetailTabsProps {
  activeTab: RevenueTabKey;
  onTabChange: (tab: RevenueTabKey) => void;
  summary: FinancialSummary | null;
  formatVND: (value: number) => string;
}

const TAB_DEFS: { key: RevenueTabKey; label: string; icon: LucideIcon }[] = [
  { key: 'bookings', label: 'Doanh thu Tour', icon: Ship },
  { key: 'commissions', label: 'Chi tiết hoa hồng (8%)', icon: TrendingUp },
  { key: 'maintenances', label: 'Chi tiết phí bảo trì', icon: Wrench },
  { key: 'docks', label: 'Chi tiết phí bến đỗ', icon: Ship },
  { key: 'history', label: 'Lịch sử thanh toán', icon: History },
];

const BookingsTab = ({
  summary,
  formatVND,
}: {
  summary: FinancialSummary | null;
  formatVND: (v: number) => string;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
          <th className="py-3 px-4">Mã đơn đặt</th>
          <th className="py-3 px-4">Tên Tour</th>
          <th className="py-3 px-4">Khách hàng</th>
          <th className="py-3 px-4">Ngày đặt</th>
          <th className="py-3 px-4">Trạng thái</th>
          <th className="py-3 px-4 text-right">Tổng giá</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 text-sm text-foreground/80">
        {summary?.bookings.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-muted-foreground">
              Không có doanh thu đặt tour nào.
            </td>
          </tr>
        ) : (
          summary?.bookings.map((b) => (
            <tr
              key={b.bookingId}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                {b.bookingId.substring(0, 8)}...
              </td>
              <td className="py-3.5 px-4 font-semibold text-foreground">
                {b.tourName}
              </td>
              <td className="py-3.5 px-4 text-foreground/90">
                {b.customerName}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground">
                {new Date(b.bookingDate).toLocaleDateString('vi-VN')}
              </td>
              <td className="py-3.5 px-4">
                <Badge
                  className={
                    b.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400'
                      : b.status === 'paid'
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400'
                  }
                >
                  {b.status.toUpperCase()}
                </Badge>
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-foreground">
                {formatVND(b.totalPrice)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const CommissionsTab = ({
  summary,
  formatVND,
}: {
  summary: FinancialSummary | null;
  formatVND: (v: number) => string;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
          <th className="py-3 px-4">Mã đơn đặt</th>
          <th className="py-3 px-4">Tên Tour</th>
          <th className="py-3 px-4 text-right">Tổng giá trị đơn</th>
          <th className="py-3 px-4 text-right">Tỷ lệ</th>
          <th className="py-3 px-4 text-right text-ddms-secondary">
            Hoa hồng phát sinh
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 text-sm text-foreground/80">
        {summary?.bookings.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-10 text-muted-foreground">
              Không có phát sinh phí hoa hồng nào.
            </td>
          </tr>
        ) : (
          summary?.bookings.map((b) => (
            <tr
              key={b.bookingId}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                {b.bookingId.substring(0, 8)}...
              </td>
              <td className="py-3.5 px-4 text-foreground font-semibold">
                {b.tourName}
              </td>
              <td className="py-3.5 px-4 text-right text-foreground/90">
                {formatVND(b.totalPrice)}
              </td>
              <td className="py-3.5 px-4 text-right text-muted-foreground">
                8%
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-ddms-secondary">
                {formatVND(b.commission)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const MaintenancesTab = ({
  summary,
  formatVND,
}: {
  summary: FinancialSummary | null;
  formatVND: (v: number) => string;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
          <th className="py-3 px-4">Tên tàu</th>
          <th className="py-3 px-4">Dịch vụ sửa chữa / bảo trì</th>
          <th className="py-3 px-4">Bắt đầu</th>
          <th className="py-3 px-4">Kết thúc</th>
          <th className="py-3 px-4">Trạng thái</th>
          <th className="py-3 px-4 text-right text-ddms-secondary">
            Chi phí dịch vụ
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 text-sm text-foreground/80">
        {summary?.maintenances.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-muted-foreground">
              Chưa có bản ghi bảo trì nào được duyệt tính phí.
            </td>
          </tr>
        ) : (
          summary?.maintenances.map((m) => (
            <tr
              key={m.maintenanceId}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="py-3.5 px-4 font-semibold text-foreground">
                {m.boatName}
              </td>
              <td className="py-3.5 px-4 text-foreground/90">
                {m.serviceName}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground">
                {new Date(m.startTime).toLocaleString('vi-VN')}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground">
                {new Date(m.endTime).toLocaleString('vi-VN')}
              </td>
              <td className="py-3.5 px-4">
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
                  {m.status.toUpperCase()}
                </Badge>
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-ddms-secondary">
                {formatVND(m.amount)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const DocksTab = ({
  summary,
  formatVND,
}: {
  summary: FinancialSummary | null;
  formatVND: (v: number) => string;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
          <th className="py-3 px-4">Tên tàu</th>
          <th className="py-3 px-4">Số đăng ký</th>
          <th className="py-3 px-4">Tháng hoạt động bến</th>
          <th className="py-3 px-4 text-right text-ddms-secondary">
            Đơn giá thuê / tháng
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 text-sm text-foreground/80">
        {summary?.dockRentals.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center py-10 text-muted-foreground">
              Chưa có bản ghi hoạt động bến nào.
            </td>
          </tr>
        ) : (
          summary?.dockRentals.map((d, index) => (
            <tr key={index} className="hover:bg-muted/30 transition-colors">
              <td className="py-3.5 px-4 font-semibold text-foreground">
                {d.boatName}
              </td>
              <td className="py-3.5 px-4 text-foreground/90">
                {d.registrationNumber || 'N/A'}
              </td>
              <td className="py-3.5 px-4 text-foreground/80">
                Tháng {d.month} / {d.year}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-ddms-secondary">
                {formatVND(d.amount)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const HistoryTab = ({
  summary,
  formatVND,
}: {
  summary: FinancialSummary | null;
  formatVND: (v: number) => string;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
          <th className="py-3 px-4">Mã tham chiếu PayOS</th>
          <th className="py-3 px-4">Mô tả giao dịch</th>
          <th className="py-3 px-4">Ngày tạo</th>
          <th className="py-3 px-4">Ngày thanh toán</th>
          <th className="py-3 px-4">Trạng thái</th>
          <th className="py-3 px-4 text-right">Số tiền</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 text-sm text-foreground/80">
        {summary?.paymentHistory.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-muted-foreground">
              Bạn chưa thực hiện giao dịch thanh toán nào.
            </td>
          </tr>
        ) : (
          summary?.paymentHistory.map((p) => (
            <tr
              key={p.paymentId}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                {p.payosOrderCode}
              </td>
              <td className="py-3.5 px-4 text-foreground font-semibold">
                {p.description}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground">
                {new Date(p.createdAt).toLocaleString('vi-VN')}
              </td>
              <td className="py-3.5 px-4 text-muted-foreground">
                {p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '-'}
              </td>
              <td className="py-3.5 px-4">
                <Badge
                  className={
                    p.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400'
                      : p.status === 'cancelled'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400'
                  }
                >
                  {p.status === 'paid'
                    ? 'THÀNH CÔNG'
                    : p.status === 'cancelled'
                      ? 'HỦY BỎ'
                      : 'CHỜ THANH TOÁN'}
                </Badge>
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-foreground">
                {formatVND(p.amount)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const RevenueDetailTabs = ({
  activeTab,
  onTabChange,
  summary,
  formatVND,
}: RevenueDetailTabsProps) => {
  return (
    <div className="bg-ddms-bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
      <div className="flex border-b border-border overflow-x-auto whitespace-nowrap bg-muted/40">
        {TAB_DEFS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === key
                ? 'border-ddms-secondary text-ddms-secondary bg-ddms-bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'bookings' && (
          <BookingsTab summary={summary} formatVND={formatVND} />
        )}
        {activeTab === 'commissions' && (
          <CommissionsTab summary={summary} formatVND={formatVND} />
        )}
        {activeTab === 'maintenances' && (
          <MaintenancesTab summary={summary} formatVND={formatVND} />
        )}
        {activeTab === 'docks' && (
          <DocksTab summary={summary} formatVND={formatVND} />
        )}
        {activeTab === 'history' && (
          <HistoryTab summary={summary} formatVND={formatVND} />
        )}
      </div>
    </div>
  );
};

export default RevenueDetailTabs;
