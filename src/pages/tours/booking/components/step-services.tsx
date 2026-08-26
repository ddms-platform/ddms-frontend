import { useTranslation } from 'react-i18next';
import { Check, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { TourServiceResponse } from '@/services/tourService';

interface StepServicesProps {
  services: TourServiceResponse[];
  selectedServiceIds: string[];
  onToggleService: (id: string) => void;
}

interface ServiceCardProps {
  service: TourServiceResponse;
  selected: boolean;
  onToggle: (id: string) => void;
}

function ServiceCard({ service, selected, onToggle }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(service.id)}
      className={`group relative flex gap-3 rounded-xl border p-4 text-left transition-all ${
        selected
          ? 'border-ddms-secondary bg-ddms-secondary/5 ring-1 ring-ddms-secondary/30'
          : 'border-border hover:border-foreground/30 bg-ddms-bg-card'
      }`}
    >
      {service.imageUrl ? (
        <img
          src={service.imageUrl}
          alt={service.name}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Package size={22} className="text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">
            {service.name}
          </h3>
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              selected
                ? 'bg-ddms-secondary border-ddms-secondary text-white'
                : 'border-border bg-transparent'
            }`}
          >
            {selected && <Check size={13} />}
          </div>
        </div>
        {service.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}
        <p className="mt-2 text-sm font-semibold text-ddms-secondary">
          +{formatPrice(service.price)}
        </p>
      </div>
    </button>
  );
}

export default function StepServices({
  services,
  selectedServiceIds,
  onToggleService,
}: StepServicesProps) {
  const { t } = useTranslation();
  const selectedSet = new Set(selectedServiceIds);
  const selected = services.filter((service) => selectedSet.has(service.id));
  const available = services.filter((service) => !selectedSet.has(service.id));

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {t('booking.services.title', 'Dịch vụ đi kèm')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          'booking.services.subtitle',
          'Chọn thêm các dịch vụ để nâng cấp trải nghiệm chuyến đi (không bắt buộc).',
        )}
      </p>

      {services.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <Package size={32} className="text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              'booking.services.empty',
              'Tour này chưa có dịch vụ đi kèm nào.',
            )}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {selected.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground">
                {t('booking.services.selectedTitle', 'Dịch vụ đã chọn')} (
                {selected.length})
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  'booking.services.selectedHint',
                  'Bỏ chọn để đưa dịch vụ trở lại danh sách bên dưới.',
                )}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selected.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected
                    onToggle={onToggleService}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-foreground">
              {t('booking.services.availableTitle', 'Thêm dịch vụ')}
            </h3>
            {available.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t(
                  'booking.services.allSelected',
                  'Bạn đã chọn hết dịch vụ của tour này.',
                )}
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {available.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={false}
                    onToggle={onToggleService}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
