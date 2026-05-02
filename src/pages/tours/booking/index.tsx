import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/shared/breadcrumb';
import type { Boat, RoomOption } from './types';
import { MOCK_TOUR, BOAT_ROOMS, DEFAULT_BOAT_ROOMS } from './mock-data';

// Step components
import StepIndicator from './components/step-indicator';
import StepDateTime from './components/step-date-time';
import StepSelectBoat from './components/step-select-boat';
import StepViewRooms from './components/step-view-rooms';
import StepGuests from './components/step-guests';
import StepConfirm from './components/step-confirm';
import BookingSuccess from './components/booking-success';

export default function BookingPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  // ── State ──
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // ── Derived ──
  const boatRooms = useMemo(() => {
    if (!selectedBoat) return [];
    return BOAT_ROOMS[selectedBoat.id] || DEFAULT_BOAT_ROOMS;
  }, [selectedBoat]);

  const tourPrice = MOCK_TOUR.price * guests;
  const roomPrice = selectedRoom ? selectedRoom.price : 0;
  const totalPrice = tourPrice + roomPrice;
  const maxGuests = selectedBoat?.capacity || MOCK_TOUR.maxGuests;

  // ── Handlers ──
  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime;
    if (step === 2) return selectedBoat !== null;
    if (step === 3) return true;
    if (step === 4) return guests >= 1 && guests <= maxGuests;
    return true;
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
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

  // ── Success screen ──
  if (isConfirmed) {
    return (
      <BookingSuccess
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        guests={guests}
        totalPrice={totalPrice}
      />
    );
  }

  // ── Main booking flow ──
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
      <StepIndicator currentStep={step} />

      {/* Step Content */}
      <div
        className="mt-8 rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: '#112240',
          boxShadow:
            'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        }}
      >
        {step === 1 && (
          <StepDateTime
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
          />
        )}

        {step === 2 && (
          <StepSelectBoat selectedBoat={selectedBoat} onSelectBoat={setSelectedBoat} />
        )}

        {step === 3 && (
          <StepViewRooms
            rooms={boatRooms}
            selectedRoom={selectedRoom}
            selectedBoatName={selectedBoat?.name || ''}
            onSelectRoom={setSelectedRoom}
          />
        )}

        {step === 4 && (
          <StepGuests
            guests={guests}
            maxGuests={maxGuests}
            selectedRoom={selectedRoom}
            tourPrice={tourPrice}
            roomPrice={roomPrice}
            totalPrice={totalPrice}
            onSetGuests={setGuests}
          />
        )}

        {step === 5 && (
          <StepConfirm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedBoat={selectedBoat}
            selectedRoom={selectedRoom}
            guests={guests}
            tourPrice={tourPrice}
            roomPrice={roomPrice}
            totalPrice={totalPrice}
          />
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
        {step < 5 ? (
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
