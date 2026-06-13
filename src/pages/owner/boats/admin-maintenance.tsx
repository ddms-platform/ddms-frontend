import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Check, X, ShieldAlert, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { boatService } from '@/services/boatService';

interface PendingMaintenance {
  id: string;
  boatId: string;
  boatName: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
  portMaintenanceServiceId?: string;
  portMaintenanceServiceName?: string;
  status: string;
}

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<PendingMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await boatService.getPendingMaintenancesAdmin();
      setRequests(res || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phê duyệt', error);
      toast.error('Không thể tải danh sách yêu cầu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await boatService.approveMaintenanceAdmin(id);
      toast.success('Đã phê duyệt yêu cầu bảo trì');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error('Phê duyệt thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await boatService.rejectMaintenanceAdmin(id);
      toast.success('Đã từ chối yêu cầu bảo trì');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error('Từ chối thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8 pb-24 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="text-cyan-400" />
          Phê duyệt Yêu cầu Bảo trì (Admin)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Xem xét và duyệt các đăng ký dịch vụ bảo trì từ chủ thuyền gửi đến
          Siêu Cảng Marina
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl py-20 text-center bg-[#112240] border border-slate-800/30">
          <Calendar size={48} className="text-slate-600 mb-3" />
          <p className="text-sm text-slate-400 font-medium">
            Chưa có yêu cầu bảo trì nào cần duyệt.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/60 bg-[#112240]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/20">
                <th className="p-4">Tên Tàu</th>
                <th className="p-4">Dịch Vụ Đăng Ký</th>
                <th className="p-4">Ngày Hẹn Sửa Chữa</th>
                <th className="p-4">Ngày Yêu Cầu</th>
                <th className="p-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">{req.boatName}</td>
                  <td className="p-4">
                    <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg border border-cyan-500/20 font-medium">
                      {req.portMaintenanceServiceName}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-slate-300">
                      {new Date(req.startTime).toLocaleDateString('vi-VN')}{' '}
                      {new Date(req.startTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
                        disabled={processingId !== null}
                        onClick={() => handleReject(req.id)}
                      >
                        {processingId === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} className="mr-1" />
                        )}
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all"
                        disabled={processingId !== null}
                        onClick={() => handleApprove(req.id)}
                      >
                        {processingId === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} className="mr-1" />
                        )}
                        Duyệt
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
