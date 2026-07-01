import { useTranslation } from 'react-i18next';

interface RecentBookingsTableProps {
  bookings: any[];
  updatingBookingId: string | null;
  onConfirm: (bookingId: string) => void;
  onComplete: (bookingId: string) => void;
  onOpenCancel: (booking: any) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  switch (status.toLowerCase()) {
    case 'paid':
      return (
        <span className="px-2 py-1 text-xs rounded bg-cyan-900/50 text-cyan-400 border border-cyan-800">
          {t('ownerTours.recentBookings.status.paid')}
        </span>
      );
    case 'pending':
      return (
        <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300 border border-slate-600">
          {t('ownerTours.recentBookings.status.pending')}
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-2 py-1 text-xs rounded bg-red-900/50 text-red-400 border border-red-800">
          {t('ownerTours.recentBookings.status.cancelled')}
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300 border border-slate-600">
          {status.toUpperCase()}
        </span>
      );
  }
};

const BookingActions = ({
  booking,
  isUpdating,
  onConfirm,
  onComplete,
  onOpenCancel,
}: {
  booking: any;
  isUpdating: boolean;
  onConfirm: (id: string) => void;
  onComplete: (id: string) => void;
  onOpenCancel: (booking: any) => void;
}) => {
  const { t } = useTranslation();
  const status = booking.status.toLowerCase();

  if (status === 'cancelled' || status === 'completed') {
    return (
      <span className="text-xs text-slate-500 font-medium italic">
        {t('ownerTours.recentBookings.actions.noAction')}
      </span>
    );
  }

  const isPending = status === 'pending' || status === 'chờ xử lý';

  return (
    <div className="flex justify-end gap-2">
      {isPending ? (
        <>
          <button
            disabled={isUpdating}
            onClick={() => onConfirm(booking.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
          >
            {isUpdating
              ? '...'
              : t('ownerTours.recentBookings.actions.confirm')}
          </button>
          <button
            disabled={isUpdating}
            onClick={() => onOpenCancel(booking)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
          >
            {t('ownerTours.recentBookings.actions.reject')}
          </button>
        </>
      ) : (
        <>
          <button
            disabled={isUpdating}
            onClick={() => onComplete(booking.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
          >
            {isUpdating
              ? '...'
              : t('ownerTours.recentBookings.actions.complete')}
          </button>
          <button
            disabled={isUpdating}
            onClick={() => onOpenCancel(booking)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
          >
            {t('ownerTours.recentBookings.actions.cancel')}
          </button>
        </>
      )}
    </div>
  );
};

const RecentBookingsTable = ({
  bookings,
  updatingBookingId,
  onConfirm,
  onComplete,
  onOpenCancel,
}: RecentBookingsTableProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          {t('ownerTours.recentBookings.title')}
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          {t('ownerTours.recentBookings.viewAll')}{' '}
          <span className="text-lg">→</span>
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-4 pr-4">
                {t('ownerTours.recentBookings.tableHeaders.bookingId')}
              </th>
              <th className="pb-4 px-4">
                {t('ownerTours.recentBookings.tableHeaders.customer')}
              </th>
              <th className="pb-4 px-4">
                {t('ownerTours.recentBookings.tableHeaders.serviceBoat')}
              </th>
              <th className="pb-4 px-4">
                {t('ownerTours.recentBookings.tableHeaders.time')}
              </th>
              <th className="pb-4 px-4">
                {t('ownerTours.recentBookings.tableHeaders.value')}
              </th>
              <th className="pb-4 px-4">
                {t('ownerTours.recentBookings.tableHeaders.status')}
              </th>
              <th className="pb-4 pl-4 text-right">
                {t('ownerTours.recentBookings.tableHeaders.action')}
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300 divide-y divide-slate-800/50">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  {t('ownerTours.recentBookings.empty')}
                </td>
              </tr>
            ) : (
              bookings.map((booking, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-4 pr-4 font-mono text-cyan-400">
                    {booking.bookingId}
                  </td>
                  <td className="py-4 px-4 text-white font-medium">
                    {booking.customerName}
                  </td>
                  <td className="py-4 px-4">
                    <div>{booking.serviceName}</div>
                    <div className="text-xs text-slate-500">
                      {t('ownerTours.recentBookings.boatPrefix', {
                        name: booking.boatName,
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {new Date(booking.time).toLocaleString(i18n.language)}
                  </td>
                  <td className="py-4 px-4">
                    {new Intl.NumberFormat(i18n.language, {
                      style: 'currency',
                      currency: 'VND',
                    }).format(booking.value)}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <BookingActions
                      booking={booking}
                      isUpdating={updatingBookingId === booking.id}
                      onConfirm={onConfirm}
                      onComplete={onComplete}
                      onOpenCancel={onOpenCancel}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentBookingsTable;
