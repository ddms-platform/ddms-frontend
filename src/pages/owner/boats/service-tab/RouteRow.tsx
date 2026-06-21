import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { RouteForm } from '../service-tab';

interface RouteRowProps {
  route: RouteForm;
  index: number;
  badgeLabel: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  onChange: (field: keyof RouteForm, value: string) => void;
}

const RouteRow = ({
  route,
  index,
  badgeLabel,
  startPlaceholder = 'Bến Bạch Đằng',
  endPlaceholder = 'Cầu Rồng',
  namePlaceholder = 'VD: Đón khách & Khởi hành',
  descriptionPlaceholder = 'VD: Đón khách tại bến, bắt đầu hành trình ngắm cảnh sông Hàn về đêm...',
  onChange,
}: RouteRowProps) => (
  <div className="flex flex-col gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
    <div className="flex items-center gap-2 mb-1">
      <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-bold">
        {badgeLabel} {index + 1}
      </span>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-slate-400">Tên chặng / Hoạt động</label>
        <Input
          placeholder={namePlaceholder}
          className="bg-[#0B132B] border-slate-700 mt-1"
          value={route.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-400">Từ (Điểm bắt đầu)</label>
          <Input
            placeholder={startPlaceholder}
            className="bg-[#0B132B] border-slate-700 mt-1"
            value={route.startPoint}
            onChange={(e) => onChange('startPoint', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400">Đến (Điểm kết thúc)</label>
          <Input
            placeholder={endPlaceholder}
            className="bg-[#0B132B] border-slate-700 mt-1"
            value={route.endPoint}
            onChange={(e) => onChange('endPoint', e.target.value)}
          />
        </div>
      </div>
    </div>
    <div>
      <label className="text-xs text-slate-400">Mô tả chi tiết chặng này</label>
      <Textarea
        placeholder={descriptionPlaceholder}
        className="bg-[#0B132B] border-slate-700 mt-1 h-15"
        value={route.description}
        onChange={(e) => onChange('description', e.target.value)}
      />
    </div>
  </div>
);

export default RouteRow;
