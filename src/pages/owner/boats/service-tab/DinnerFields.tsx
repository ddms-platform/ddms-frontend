import { Plus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComboRow from './ComboRow';
import type { ServiceFormState, ServiceHandlers } from './types';

interface DinnerFieldsProps {
  service: ServiceFormState;
  handlers: ServiceHandlers;
}

const DinnerFields = ({ service, handlers }: DinnerFieldsProps) => (
  <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
    <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
      <Utensils className="w-5 h-5" /> Dịch vụ Ăn tối (Menu Combos)
    </h3>
    <p className="text-xs text-slate-400">
      Vé lên tàu là mặc định. Thêm các combo ăn uống để khách chọn thêm.
    </p>
    {service.combos.map((combo, idx) => (
      <ComboRow
        key={idx}
        combo={combo}
        onChange={(field, value) =>
          handlers.updateArrayItem(service.id, 'combos', idx, field, value)
        }
        onUploadImage={(file) =>
          handlers.uploadImage(service.id, 'combos', idx, file)
        }
      />
    ))}
    <Button
      type="button"
      variant="outline"
      onClick={() => handlers.addArrayItem(service.id, 'combos')}
      className="w-full border-dashed border-slate-700 bg-transparent text-yellow-400 hover:bg-slate-800"
    >
      <Plus className="w-4 h-4 mr-2" /> Thêm Combo Mới
    </Button>
  </div>
);

export default DinnerFields;
