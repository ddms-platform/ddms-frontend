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
            <td colSpan={6} className="text-center py-10 text-slate-500">
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
              <td className="py-3.5 px-4 text-slate-300">{b.customerName}</td>
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
            <td colSpan={5} className="text-center py-10 text-slate-500">
              Không có phát sinh phí hoa hồng nào.
            </td>
          </tr>
        ) : (
          summary?.bookings.map((b) => (
            <tr key={b.bookingId} className="hover:bg-slate-800/20">
              <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                {b.bookingId.substring(0, 8)}...
              </td>
              <td className="py-3.5 px-4 text-slate-200">{b.tourName}</td>
              <td className="py-3.5 px-4 text-right text-slate-300">
                {formatVND(b.totalPrice)}
              </td>
              <td className="py-3.5 px-4 text-right text-slate-400">8%</td>
              <td className="py-3.5 px-4 text-right font-bold text-cyan-400">
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
            <td colSpan={6} className="text-center py-10 text-slate-500">
              Chưa có bản ghi bảo trì nào được duyệt tính phí.
            </td>
          </tr>
        ) : (
          summary?.maintenances.map((m) => (
            <tr key={m.maintenanceId} className="hover:bg-slate-800/20">
              <td className="py-3.5 px-4 font-semibold text-slate-200">
                {m.boatName}
              </td>
              <td className="py-3.5 px-4 text-slate-300">{m.serviceName}</td>
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
            <td colSpan={4} className="text-center py-10 text-slate-500">
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
            <td colSpan={6} className="text-center py-10 text-slate-500">
              Bạn chưa thực hiện giao dịch thanh toán nào.
            </td>
          </tr>
        ) : (
          summary?.paymentHistory.map((p) => (
            <tr key={p.paymentId} className="hover:bg-slate-800/20">
              <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                {p.payosOrderCode}
              </td>
              <td className="py-3.5 px-4 text-slate-200">{p.description}</td>
              <td className="py-3.5 px-4 text-slate-400">
                {new Date(p.createdAt).toLocaleString('vi-VN')}
              </td>
              <td className="py-3.5 px-4 text-slate-400">
                {p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '-'}
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
);

const RevenueDetailTabs = ({
  activeTab,
  onTabChange,
  summary,
  formatVND,
}: RevenueDetailTabsProps) => {
  return (
    <div className="bg-[#111C3A] rounded-2xl border border-slate-800/60 overflow-hidden shadow-lg">
      <div className="flex border-b border-slate-800 overflow-x-auto whitespace-nowrap bg-slate-900/40">
        {TAB_DEFS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`px-6 py-4 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === key
                ? 'border-cyan-500 text-cyan-400 bg-[#111C3A]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
