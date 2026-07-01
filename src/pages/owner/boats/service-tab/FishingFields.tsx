import { Anchor } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceFormState, ServiceHandlers } from './types';

interface FishingFieldsProps {
  service: ServiceFormState;
  handlers: ServiceHandlers;
}

const FishingFields = ({ service, handlers }: FishingFieldsProps) => (
  <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
    <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
      <Anchor className="w-5 h-5" /> Trải nghiệm Câu Mực Đêm
    </h3>
    <div>
      <label className="text-sm font-medium text-slate-300">
        Dụng cụ cung cấp
      </label>
      <Textarea
        placeholder="VD: Cần câu mực, mồi giả, áo phao, bữa ăn nhẹ..."
        className="bg-[#0B132B] border-slate-700 mt-1"
        value={service.equipments}
        onChange={(e) =>
          handlers.updateService(service.id, 'equipments', e.target.value)
        }
      />
    </div>
  </div>
);

export default FishingFields;
