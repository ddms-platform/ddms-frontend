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
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="p-4 bg-linear-to-r from-ddms-secondary/10 to-blue-500/10 border border-ddms-secondary/20 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Số tiền cần thanh toán
        </p>
        <h4 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
          {formatVND(summary.remainingBalance)}
        </h4>
      </div>
      <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 py-1 px-3 dark:text-amber-400">
        Dư nợ hiện tại
      </Badge>
    </div>

    <div>
      <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-ddms-secondary" /> Chi tiết các
        khoản phải trả
      </h5>

      <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-muted/20">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>1. Hoa hồng đại lý (8% doanh thu tour)</span>
            <span className="text-ddms-secondary">
              {formatVND(summary.commissionOwed)}
            </span>
          </div>
          {summary.commissionOwed > 0 ? (
            <div className="max-h-24 overflow-y-auto pl-4 text-xs text-muted-foreground space-y-1.5 scrollbar-thin">
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
            <p className="text-xs text-muted-foreground italic pl-4">
              Không có phát sinh nợ hoa hồng.
            </p>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>2. Phí dịch vụ bảo trì (Đã được duyệt)</span>
            <span className="text-ddms-secondary">
              {formatVND(summary.maintenanceOwed)}
            </span>
          </div>
          {summary.maintenanceOwed > 0 ? (
            <div className="max-h-24 overflow-y-auto pl-4 text-xs text-muted-foreground space-y-1.5 scrollbar-thin">
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
            <p className="text-xs text-muted-foreground italic pl-4">
              Không có phí bảo trì nào cần đóng.
            </p>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>3. Phí thuê bến đỗ (5.000.000 đ / tháng)</span>
            <span className="text-ddms-secondary">
              {formatVND(summary.dockRentalOwed)}
            </span>
          </div>
          {summary.dockRentalOwed > 0 ? (
            <div className="max-h-24 overflow-y-auto pl-4 text-xs text-muted-foreground space-y-1.5 scrollbar-thin">
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
            <p className="text-xs text-muted-foreground italic pl-4">
              Không có phí thuê bến phát sinh.
            </p>
          )}
        </div>

        <div className="p-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            4. Tổng số tiền đã thanh toán trước đó
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            -{formatVND(summary.totalPaid)}
          </span>
        </div>
      </div>
    </div>

    <div className="flex gap-3 pt-2">
      <Button
        onClick={onClose}
        variant="outline"
        className="flex-1 border-border hover:bg-muted text-foreground cursor-pointer"
      >
        Hủy bỏ
      </Button>
      <Button
        onClick={onConfirm}
        disabled={paying}
        className="flex-1 bg-ddms-secondary hover:bg-ddms-secondary/90 text-white font-bold border-none cursor-pointer shadow-md shadow-ddms-secondary/15"
      >
        {paying ? 'Đang tạo link...' : 'Xác nhận & Thanh toán qua PayOS'}
      </Button>
    </div>
  </div>
);

export default BreakdownStep;
