import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/shared/breadcrumb';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { RoomOption } from './types';
import { tourService, type TourItemResponse } from '@/services/tourService';

// Step components
import StepIndicator from './components/step-indicator';
import StepDateTime from './components/step-date-time';
import StepViewRooms from './components/step-view-rooms';
import StepGuests from './components/step-guests';
import StepConfirm from './components/step-confirm';
import BookingSuccess from './components/booking-success';

export default function BookingPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  // ── State ──
  const [step, setStep] = useState(1);
  const [tour, setTour] = useState<TourItemResponse | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // ── Fetch Data ──
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tourData, schedulesData] = await Promise.all([
          tourService.getPublicTourById(id),
          tourService.getTourSchedules(id).catch(() => []),
        ]);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Ignore time, only compare date

        console.log('DEBUG: schedulesData from API:', schedulesData);

        const futureSchedules = (schedulesData || []).filter((s: any) => {
          const startTime = new Date(s.start_time);
          console.log(
            `DEBUG: checking schedule ${s.start_time}, is it > now?`,
            startTime > now,
          );
          return startTime >= now;
        });

        console.log('DEBUG: futureSchedules:', futureSchedules);

        setTour(tourData);
        setSchedules(futureSchedules);
      } catch (error) {
        console.error('Failed to fetch booking details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Derived State ──
  const hasRooms = useMemo(() => {
    return !!tour && tour.classes && tour.classes.length > 0;
  }, [tour]);

  const rooms: RoomOption[] = useMemo(() => {
    if (!tour || !tour.classes) return [];
    return tour.classes.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.name.toLowerCase().includes('vip')
        ? 'vip'
        : c.name.toLowerCase().includes('deluxe')
          ? 'deluxe'
          : 'standard',
      price: c.price,
      maxAdults: c.capacity,
      maxChildren: 0,
      area: 'Tiêu chuẩn',
      bed: '1 giường đôi hoặc 2 giường đơn',
      rating: 5,
      reviewCount: 0,
      totalRooms: 10,
      availableRooms: 10,
      images: [
        c.imageUrl ||
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop',
      ],
      description:
        c.description || 'Hạng ghế / phòng nghỉ chất lượng cao trên du thuyền',
      amenities: [],
      reviews: [],
      ratingBreakdown: [],
    }));
  }, [tour]);

  const basePrice = tour ? tour.price : 0;
  const tourPrice = basePrice * guests;
  const roomPrice = selectedRoom ? selectedRoom.price : 0;
  const totalPrice = tourPrice + roomPrice;
  const maxGuests =
    selectedSchedule?.maxCapacity || tour?.classes?.[0]?.capacity || 50;

  // ── Handlers ──
  const canProceed = () => {
    if (step === 1) return selectedSchedule !== null;
    if (hasRooms) {
      if (step === 2) return true; // Room selection is optional
      if (step === 3) return guests >= 1 && guests <= maxGuests;
    } else {
      if (step === 2) return guests >= 1 && guests <= maxGuests;
    }
    return true;
  };

  const handleNext = () => {
    const totalSteps = hasRooms ? 4 : 3;
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#00F0FF]" />
          <p className="text-sm font-medium text-gray-400">
            Đang tải thông tin đặt tour...
          </p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-white">
        Không tìm thấy thông tin tour. Vui lòng thử lại sau.
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-white gap-4">
        <h2 className="text-2xl font-bold">Tạm đóng</h2>
        <p className="text-gray-400 text-center max-w-md">
          Tour này hiện tại chưa có lịch trình khởi hành mới. Vui lòng quay lại
          sau hoặc chọn một tour khác.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const selectedDate = selectedSchedule
    ? new Date(selectedSchedule.start_time).toISOString().split('T')[0]
    : '';
  const selectedTime = selectedSchedule
    ? `${new Date(selectedSchedule.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedSchedule.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : '';

  // ── Success screen ──
  if (isConfirmed) {
    return (
      <BookingSuccess
        tourName={tour.name}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        guests={guests}
        totalPrice={totalPrice}
      />
    );
  }

  const totalSteps = hasRooms ? 4 : 3;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.tours'), to: '/tours' },
          { label: tour.name, to: `/tours/${id}` },
          { label: t('booking.title') },
        ]}
      />

      {/* Title */}
      <h1
        className="text-[28px] font-bold"
        style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
      >
        {t('booking.title')}
      </h1>
      <p className="mt-1 text-sm text-[#00F0FF]">{tour.name}</p>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} hasRooms={hasRooms} />

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
            schedules={schedules}
            selectedSchedule={selectedSchedule}
            onSelectSchedule={(sched) => {
              setSelectedSchedule(sched);
              setSelectedRoom(null);
            }}
          />
        )}

        {hasRooms ? (
          <>
            {step === 2 && (
              <StepViewRooms
                rooms={rooms}
                selectedRoom={selectedRoom}
                selectedBoatName={selectedSchedule?.boatName || 'Du thuyền'}
                onSelectRoom={setSelectedRoom}
              />
            )}

            {step === 3 && (
              <StepGuests
                guests={guests}
                maxGuests={maxGuests}
                selectedRoom={selectedRoom}
                tourPrice={tourPrice}
                roomPrice={roomPrice}
                totalPrice={totalPrice}
                onSetGuests={setGuests}
                basePrice={basePrice}
              />
            )}

            {step === 4 && (
              <StepConfirm
                tour={tour}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedRoom={selectedRoom}
                guests={guests}
                tourPrice={tourPrice}
                roomPrice={roomPrice}
                totalPrice={totalPrice}
                selectedSchedule={selectedSchedule}
                onConfirm={handleConfirm}
              />
            )}
          </>
        ) : (
          <>
            {step === 2 && (
              <StepGuests
                guests={guests}
                maxGuests={maxGuests}
                selectedRoom={selectedRoom}
                tourPrice={tourPrice}
                roomPrice={roomPrice}
                totalPrice={totalPrice}
                onSetGuests={setGuests}
                basePrice={basePrice}
              />
            )}

            {step === 3 && (
              <StepConfirm
                tour={tour}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedRoom={selectedRoom}
                guests={guests}
                tourPrice={tourPrice}
                roomPrice={roomPrice}
                totalPrice={totalPrice}
                selectedSchedule={selectedSchedule}
                onConfirm={handleConfirm}
              />
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <Button
            variant="dark-outline"
            size="action-lg"
            className="flex-1"
            onClick={handleBack}
          >
            {t('booking.back')}
          </Button>
        )}
        {step < totalSteps && (
          <Button
            variant="cyan"
            size="action-lg"
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {t('booking.next')}
          </Button>
        )}
      </div>
    </div>
  );
}
