import { Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      <div className="bg-[#0f172a] w-full max-w-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            {t('ownerTours.createModal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('ownerTours.createModal.selectBoat')}
            </label>
            <select
              className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              value={selectedBoatId}
              onChange={(e) => onBoatChange(e.target.value)}
            >
              <option value="">
                {t('ownerTours.createModal.selectBoatPlaceholder')}
              </option>
              {boats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('ownerTours.createModal.selectTour')}
            </label>
            <select
              className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
              value={selectedTourId}
              onChange={(e) => onTourChange(e.target.value)}
              disabled={!selectedBoatId}
            >
              <option value="">
                {t('ownerTours.createModal.selectTourPlaceholder')}
              </option>
              {availableTours.map((tour: any) => (
                <option key={tour.id} value={tour.id}>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('ownerTours.createModal.startDate')}
              </label>
              <input
                type="date"
                className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                value={scheduleDate}
                onChange={(e) => {
                  onScheduleDateChange(e.target.value);
                  if (!scheduleEndDate) {
                    onScheduleEndDateChange(e.target.value);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('ownerTours.createModal.startTime')}
              </label>
              <input
                type="time"
                className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                value={scheduleTime}
                onChange={(e) => onScheduleTimeChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('ownerTours.createModal.endDate')}
              </label>
              <input
                type="date"
                className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                value={scheduleEndDate}
                onChange={(e) => onScheduleEndDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('ownerTours.createModal.endTime')}
              </label>
              <input
                type="time"
                className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors scheme-dark"
                value={scheduleEndTime}
                onChange={(e) => onScheduleEndTimeChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            {t('ownerTours.createModal.cancelBtn')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaveDisabled}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 text-white text-sm font-bold rounded-md transition-colors"
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
