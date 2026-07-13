import { Plus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComboRow from './ComboRow';
import type { ServiceFormState, ServiceHandlers } from './types';

interface DinnerFieldsProps {
  service: ServiceFormState;
  handlers: ServiceHandlers;
}

const DinnerFields = ({ service, handlers }: DinnerFieldsProps) => (
  <div className="space-y-5 border-t border-border pt-7 mt-7">
    <h3 className="text-xl font-semibold text-amber-600 dark:text-yellow-400 flex items-center gap-2.5">
      <Utensils className="w-5 h-5" /> Dịch vụ Ăn tối (Menu Combos)
    </h3>
    <p className="text-sm text-muted-foreground">
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
      className="w-full border-dashed border-border bg-transparent text-amber-600 dark:text-yellow-400 hover:bg-foreground/5 py-6 text-sm"
    >
      <Plus className="w-4 h-4 mr-2" /> Thêm Combo Mới
    </Button>
  </div>
);

export default DinnerFields;
