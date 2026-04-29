import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, CreditCard, CheckCircle2, Ship } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Breadcrumb from '@/components/shared/breadcrumb';

// Mock data
const MOCK_TOUR = {
  title: 'Tour Sông Hàn Về Đêm',
  price: 350000,
  duration: '2 giờ',
  maxGuests: 30,
};

const AVAILABLE_DATES = [
  '2026-04-25',
  '2026-04-26',
  '2026-04-27',
  '2026-04-28',
  '2026-04-29',
  '2026-04-30',
  '2026-05-01',
];

const TIME_SLOTS = ['17:30', '19:00', '20:30'];

export default function BookingPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const totalPrice = MOCK_TOUR.price * guests;

  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime;
    if (step === 2) return guests >= 1 && guests <= MOCK_TOUR.maxGuests;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // TODO: API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsConfirmed(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'long' });
  };

  if (isConfirmed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #34A853, #2d9348)' }}
        >
          <CheckCircle2 size={40} color="#ffffff" />
        </div>
        <h1
          className="text-[28px] font-bold"
          style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
        >
          {t('booking.success.title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
          {t('booking.success.description')}
        </p>

        <div
          className="mt-8 rounded-2xl p-6 text-left"
          style={{
            backgroundColor: '#112240',
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: '#ecf0ff' }}>{t('booking.summary.tour')}</span>
              <span className="font-medium" style={{ color: '#ffffff' }}>
                {MOCK_TOUR.title}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#ecf0ff' }}>{t('booking.summary.date')}</span>
              <span className="font-medium" style={{ color: '#ffffff' }}>
                {formatDate(selectedDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#ecf0ff' }}>{t('booking.summary.time')}</span>
              <span className="font-medium" style={{ color: '#ffffff' }}>
                {selectedTime}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#ecf0ff' }}>{t('booking.summary.guests')}</span>
              <span className="font-medium" style={{ color: '#ffffff' }}>
                {guests}
              </span>
            </div>
            <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div className="flex justify-between">
              <span className="font-semibold" style={{ color: '#ffffff' }}>
                {t('booking.summary.total')}
              </span>
              <span className="font-bold" style={{ color: '#00F0FF' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg py-3 text-center text-sm font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#112240' }}
          >
            {t('booking.success.viewBookings')}
          </Link>
          <Link
            to="/"
            className="rounded-lg border py-3 text-center text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
          >
            {t('booking.success.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.tours'), to: '/tours' },
          { label: MOCK_TOUR.title, to: `/tours/${id}` },
          { label: t('booking.title') },
        ]}
      />

      {/* Title */}
      <h1 className="text-[28px] font-bold" style={{ color: '#ffffff', letterSpacing: '-0.44px' }}>
        {t('booking.title')}
      </h1>
      <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
        {MOCK_TOUR.title}
      </p>

      {/* Step Indicator */}
      <div className="mt-8 flex items-center gap-2">
        {[
          { num: 1, icon: Calendar, label: t('booking.steps.date') },
          { num: 2, icon: Users, label: t('booking.steps.guests') },
          { num: 3, icon: CreditCard, label: t('booking.steps.confirm') },
        ].map(({ num, icon: Icon, label }, i) => (
          <div key={num} className="flex flex-1 items-center gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all"
                style={{
                  backgroundColor: step >= num ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                  color: step >= num ? '#112240' : '#ecf0ff',
                }}
              >
                <Icon size={18} />
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: step >= num ? '#ffffff' : '#ecf0ff' }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className="mb-5 h-0.5 flex-1"
                style={{ backgroundColor: step > num ? '#00F0FF' : 'rgba(255,255,255,0.15)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        className="mt-8 rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: '#112240',
          boxShadow:
            'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        }}
      >
        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {t('booking.dateTime.title')}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
              {t('booking.dateTime.subtitle')}
            </p>

            {/* Date Grid */}
            <div className="mt-6">
              <label className="mb-3 block text-sm font-medium" style={{ color: '#ffffff' }}>
                {t('booking.dateTime.selectDate')}
              </label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {AVAILABLE_DATES.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="rounded-xl border p-3 text-center text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
                    style={{
                      borderColor: selectedDate === date ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                      backgroundColor: selectedDate === date ? 'rgba(0,240,255,0.08)' : '#112240',
                      color: selectedDate === date ? '#00F0FF' : '#ffffff',
                    }}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="mt-6">
              <label className="mb-3 block text-sm font-medium" style={{ color: '#ffffff' }}>
                {t('booking.dateTime.selectTime')}
              </label>
              <div className="flex gap-3">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className="flex-1 rounded-xl border py-3 text-center text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98]"
                    style={{
                      borderColor: selectedTime === time ? '#00F0FF' : 'rgba(255,255,255,0.15)',
                      backgroundColor: selectedTime === time ? 'rgba(0,240,255,0.08)' : '#112240',
                      color: selectedTime === time ? '#00F0FF' : '#ffffff',
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Guests */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {t('booking.guests.title')}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
              {t('booking.guests.subtitle', { max: MOCK_TOUR.maxGuests })}
            </p>

            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              >
                −
              </button>
              <span className="w-16 text-center text-3xl font-bold" style={{ color: '#ffffff' }}>
                {guests}
              </span>
              <button
                onClick={() => setGuests((g) => Math.min(MOCK_TOUR.maxGuests, g + 1))}
                disabled={guests >= MOCK_TOUR.maxGuests}
                className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-30"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              >
                +
              </button>
            </div>

            {/* Price Breakdown */}
            <div
              className="mx-auto mt-8 max-w-sm space-y-2 rounded-xl p-4"
              style={{ backgroundColor: '#112240' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: '#ecf0ff' }}>
                  {formatPrice(MOCK_TOUR.price)} × {guests} {t('booking.guests.people')}
                </span>
                <span className="font-medium" style={{ color: '#ffffff' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div className="flex justify-between">
                <span className="font-semibold" style={{ color: '#ffffff' }}>
                  {t('booking.summary.total')}
                </span>
                <span className="font-bold" style={{ color: '#00F0FF' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {t('booking.confirm.title')}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#ecf0ff' }}>
              {t('booking.confirm.subtitle')}
            </p>

            <div className="mt-6 space-y-4">
              {/* Tour Info */}
              <div
                className="flex items-center gap-4 rounded-xl p-4"
                style={{ backgroundColor: '#112240' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #00F0FF, #00d4e0)' }}
                >
                  <Ship size={22} color="#ffffff" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#ffffff' }}>
                    {MOCK_TOUR.title}
                  </p>
                  <p className="text-sm" style={{ color: '#ecf0ff' }}>
                    {MOCK_TOUR.duration}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div
                className="space-y-3 rounded-xl border p-4"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#ecf0ff' }}>{t('booking.summary.date')}</span>
                  <span className="font-medium" style={{ color: '#ffffff' }}>
                    {formatDate(selectedDate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#ecf0ff' }}>{t('booking.summary.time')}</span>
                  <span className="font-medium" style={{ color: '#ffffff' }}>
                    {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#ecf0ff' }}>{t('booking.summary.guests')}</span>
                  <span className="font-medium" style={{ color: '#ffffff' }}>
                    {guests} {t('booking.guests.people')}
                  </span>
                </div>
                <div className="h-px" style={{ backgroundColor: '#112240' }} />
                <div className="flex justify-between">
                  <span className="font-semibold" style={{ color: '#ffffff' }}>
                    {t('booking.summary.total')}
                  </span>
                  <span className="text-lg font-bold" style={{ color: '#00F0FF' }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 rounded-lg border py-3.5 text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
          >
            {t('booking.back')}
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 rounded-lg py-3.5 text-sm font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: '#00F0FF' }}
          >
            {t('booking.next')}
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg py-3.5 text-sm font-medium text-[#0A192F] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: '#00F0FF' }}
          >
            {isSubmitting ? t('booking.confirm.processing') : t('booking.confirm.pay')}
          </button>
        )}
      </div>
    </div>
  );
}
