import { Ship } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ServiceFormState, ServiceHandlers } from './types';

interface SpeedboatFieldsProps {
  service: ServiceFormState;
  handlers: ServiceHandlers;
}

const SpeedboatFields = ({ service, handlers }: SpeedboatFieldsProps) => (
  <div className="space-y-4 border-t border-border pt-6 mt-6">
    <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
      <Ship className="w-5 h-5" /> Cho thuê Ca Nô Cao Tốc
    </h3>
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground">
          Giá thuê 1 Giờ (Mặc định)
        </label>
        <Input
          type="number"
          disabled
          value={service.basePrice}
          className="bg-ddms-bg-main border-border text-foreground mt-1 opacity-50"
        />
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground">
          Giá thuê Nguyên Ngày
        </label>
        <Input
          type="number"
          placeholder="5000000"
          className="bg-ddms-bg-main border-border text-foreground mt-1"
          value={service.pricePerDay}
          onChange={(e) =>
            handlers.updateService(service.id, 'pricePerDay', e.target.value)
          }
        />
      </div>
    </div>
  </div>
);

export default SpeedboatFields;
