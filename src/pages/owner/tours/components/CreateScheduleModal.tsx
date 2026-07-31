import { Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DateInput from '@/components/ui/date-input';

interface CreateScheduleModalProps {
  open: boolean;
  boats: any[];
  selectedBoatId: string;
  selectedTourId: string;
  scheduleDate: string;
  scheduleTime: string;
  scheduleEndDate: string;
  scheduleEndTime: string;
  isCreating: boolean;
  onBoatChange: (boatId: string) => void;
  onTourChange: (tourId: string) => void;
  onScheduleDateChange: (value: string) => void;
  onScheduleTimeChange: (value: string) => void;
  onScheduleEndDateChange: (value: string) => void;
  onScheduleEndTimeChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const CreateScheduleModal = ({
  open,
  boats,
  selectedBoatId,
  selectedTourId,
  scheduleDate,
  scheduleTime,
  scheduleEndDate,
  scheduleEndTime,
  isCreating,
  onBoatChange,
  onTourChange,
  onScheduleDateChange,
  onScheduleTimeChange,
  onScheduleEndDateChange,
  onScheduleEndTimeChange,
  onClose,
  onConfirm,
}: CreateScheduleModalProps) => {
  const { t } = useTranslation();

  if (!open) return null;

  const availableTours =
    boats.find((b) => b.id === selectedBoatId)?.tours || [];

  const isSaveDisabled =
    isCreating ||
    !selectedBoatId ||
    !selectedTourId ||
    !scheduleDate ||
    !scheduleTime ||
    !scheduleEndDate ||
    !scheduleEndTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-ddms-bg-card text-foreground w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-ddms-bg-main/50">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ddms-secondary" />
            {t('ownerTours.createModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t('ownerTours.createModal.selectBoat')}
            </label>
            <select
              className="w-full bg-ddms-bg-main border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:border-ddms-secondary transition-colors"
              value={selectedBoatId}
              onChange={(e) => onBoatChange(e.target.value)}
            >
              <option value="">
                {t('ownerTours.createModal.selectBoatPlaceholder')}
              </option>
              {boats.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  className="bg-ddms-bg-card text-foreground"
                >
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t('ownerTours.createModal.selectTour')}
            </label>
            <select
              className="w-full bg-ddms-bg-main border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:border-ddms-secondary transition-colors disabled:opacity-50"
              value={selectedTourId}
              onChange={(e) => onTourChange(e.target.value)}
              disabled={!selectedBoatId}
            >
              <option value="">
                {t('ownerTours.createModal.selectTourPlaceholder')}
              </option>
              {availableTours.map((tour: any) => (
                <option
                  key={tour.id}
                  value={tour.id}
                  className="bg-ddms-bg-card text-foreground"
                >
                  {tour.name}
                </option>
              ))}
            </select>
            {selectedBoatId && availableTours.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">
                {t('ownerTours.createModal.noTourWarning')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('ownerTours.createModal.startDate')}
              </label>
              <DateInput
                className="w-full bg-ddms-bg-main border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:border-ddms-secondary transition-colors"
                value={scheduleDate}
                onChange={(iso) => {
                  onScheduleDateChange(iso);
                  if (!scheduleEndDate) {
                    onScheduleEndDateChange(iso);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('ownerTours.createModal.startTime')}
              </label>
              <input
                type="time"
                className="w-full bg-ddms-bg-main border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:border-ddms-secondary transition-colors"
                value={scheduleTime}
                onChange={(e) => onScheduleTimeChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('ownerTours.createModal.endDate')}
              </label>
              <DateInput
                className="w-full bg-ddms-bg-main border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:border-ddms-secondary transition-colors"
                value={scheduleEndDate}
                onChange={onScheduleEndDateChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t('ownerTours.createModal.endTime')}
              </label>
              <input
                type="time"
                className="w-full bg-ddms-bg-main border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:border-ddms-secondary transition-colors"
                value={scheduleEndTime}
                onChange={(e) => onScheduleEndTimeChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-ddms-bg-main/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('ownerTours.createModal.cancelBtn')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaveDisabled}
            className="px-4 py-2 bg-ddms-primary hover:bg-ddms-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-bold rounded-md transition-colors"
          >
            {isCreating
              ? t('ownerTours.createModal.savingBtn')
              : t('ownerTours.createModal.saveBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateScheduleModal;
