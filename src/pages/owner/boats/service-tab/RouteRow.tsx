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

const fieldLabelClass = 'text-sm font-medium text-muted-foreground';
const inputClass =
  'h-11 bg-ddms-bg-main border-border text-sm text-foreground mt-1.5';

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
  <div className="flex flex-col gap-5 rounded-xl border border-border bg-muted/30 p-5">
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-ddms-secondary/20 px-3 py-1 text-sm font-bold text-ddms-secondary">
        {badgeLabel} {index + 1}
      </span>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className={fieldLabelClass}>Tên chặng / Hoạt động</label>
        <Input
          placeholder={namePlaceholder}
          className={inputClass}
          value={route.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={fieldLabelClass}>Từ (Điểm bắt đầu)</label>
          <Input
            placeholder={startPlaceholder}
            className={inputClass}
            value={route.startPoint}
            onChange={(e) => onChange('startPoint', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className={fieldLabelClass}>Đến (Điểm kết thúc)</label>
          <Input
            placeholder={endPlaceholder}
            className={inputClass}
            value={route.endPoint}
            onChange={(e) => onChange('endPoint', e.target.value)}
          />
        </div>
      </div>
    </div>

    <div>
      <label className={fieldLabelClass}>Mô tả chi tiết chặng này</label>
      <Textarea
        placeholder={descriptionPlaceholder}
        className="bg-ddms-bg-main border-border text-sm text-foreground mt-1.5 h-24 resize-none"
        value={route.description}
        onChange={(e) => onChange('description', e.target.value)}
      />
    </div>
  </div>
);

export default RouteRow;
