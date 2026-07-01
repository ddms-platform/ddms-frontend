import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FinancialSummary } from '@/services/billingService';

interface BreakdownStepProps {
  summary: FinancialSummary;
  formatVND: (v: number) => string;
  paying: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BreakdownStep = ({
  summary,
  formatVND,
  paying,
  onClose,
  onConfirm,
}: BreakdownStepProps) => (
  <div className="space-y-6">
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

    <div>
      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cyan-400" /> Chi tiết các khoản phải
        trả
      </h5>

      <div className="border border-slate-800/80 rounded-xl divide-y divide-slate-800/80 overflow-hidden bg-slate-900/20">
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
                <div key={b.bookingId} className="flex justify-between">
                  <span>
                    • {b.tourName} ({b.customerName})
                  </span>
                  <span className="font-mono">{formatVND(b.commission)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic pl-4">
              Không có phát sinh nợ hoa hồng.
            </p>
          )}
        </div>

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
                <div key={m.maintenanceId} className="flex justify-between">
                  <span>
                    • Tàu {m.boatName} - {m.serviceName}
                  </span>
                  <span className="font-mono">{formatVND(m.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic pl-4">
              Không có phí bảo trì nào cần đóng.
            </p>
          )}
        </div>

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
                  <span className="font-mono">{formatVND(d.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic pl-4">
              Không có phí thuê bến phát sinh.
            </p>
          )}
        </div>

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

    <div className="flex gap-3 pt-2">
      <Button
        onClick={onClose}
        variant="outline"
        className="flex-1 border-slate-800 hover:bg-slate-800 text-slate-300"
      >
        Hủy bỏ
      </Button>
      <Button
        onClick={onConfirm}
        disabled={paying}
        className="flex-1 bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold border-none"
      >
        {paying ? 'Đang tạo link...' : 'Xác nhận & Thanh toán qua PayOS'}
      </Button>
    </div>
  </div>
);

export default BreakdownStep;
