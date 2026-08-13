import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/shared/breadcrumb';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { RoomOption } from './types';
import {
  tourService,
  type TourItemResponse,
  type TourServiceResponse,
} from '@/services/tourService';
import {
  bookingService,
  type CabinAvailabilityResponse,
} from '@/services/bookingService';

// Step components
import StepIndicator from './components/step-indicator';
import StepDateTime from './components/step-date-time';
import StepViewRooms from './components/step-view-rooms';
import StepServices from './components/step-services';
import StepGuests from './components/step-guests';
import StepConfirm from './components/step-confirm';
import BookingSuccess from './components/booking-success';

export default function BookingPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const prefillRoomKeyRef = useRef<string | null>(null);

  const bookingPrefill = useMemo(() => {
    const statePrefill = (
      location.state as {
        bookingPrefill?: {
          classId?: string;
          serviceIds?: string[];
        };
      } | null
    )?.bookingPrefill;
    const params = new URLSearchParams(location.search);
    const classId = params.get('classId') || statePrefill?.classId || '';
    const serviceIdsFromQuery =
      params
        .get('services')
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) || [];

    return {
      classId,
      serviceIds:
        serviceIdsFromQuery.length > 0
          ? serviceIdsFromQuery
          : statePrefill?.serviceIds || [],
    };
  }, [location.search, location.state]);

  // ── State ──
  const [step, setStep] = useState(1);
  const [tour, setTour] = useState<TourItemResponse | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [cabinAvailability, setCabinAvailability] = useState<
    CabinAvailabilityResponse[]
  >([]);
  const [availabilityScheduleId, setAvailabilityScheduleId] = useState<
    string | null
  >(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
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

        const futureSchedules = (schedulesData || []).filter((s: any) => {
          const startTime = new Date(s.start_time);
          return startTime >= now;
        });

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
  useEffect(() => {
    if (!selectedSchedule?.id) {
      const timer = window.setTimeout(() => {
        setCabinAvailability([]);
        setAvailabilityScheduleId(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    let active = true;
    const fetchCabinAvailability = async () => {
      setIsAvailabilityLoading(true);
      setAvailabilityScheduleId(null);
      try {
        const data = await bookingService.getCabinAvailability(
          selectedSchedule.id,
        );
        if (active) {
          setCabinAvailability(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch cabin availability:', error);
        if (active) {
          setCabinAvailability([]);
        }
      } finally {
        if (active) {
          setAvailabilityScheduleId(selectedSchedule.id);
          setIsAvailabilityLoading(false);
        }
      }
    };

    fetchCabinAvailability();

    return () => {
      active = false;
    };
  }, [selectedSchedule?.id]);

  const rooms: RoomOption[] = useMemo(() => {
    if (!tour) return [];

    const tourClasses = tour.classes || [];
    const classById = new Map(tourClasses.map((c) => [c.id, c]));
    const classByName = new Map(
      tourClasses.map((c) => [c.name.toLowerCase(), c]),
    );
    const source =
      cabinAvailability.length > 0
        ? cabinAvailability.map((c) => {
            const cabinClass =
              classById.get(c.cabinId) ||
              classByName.get(c.cabinName.toLowerCase());
            return {
              id: c.cabinId,
              name: c.cabinName,
              capacity: c.capacity,
              price: c.price,
              totalRooms: c.totalRooms,
              availableRooms: c.availableRooms,
              bookedRooms: c.bookedRooms,
              description: cabinClass?.description,
              imageUrl: cabinClass?.imageUrl,
            };
          })
        : tourClasses.map((c) => ({
            ...c,
            totalRooms: 1,
            availableRooms: 1,
            bookedRooms: 0,
          }));

    return source.map((c) => ({
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
      totalRooms: c.totalRooms,
      availableRooms: c.availableRooms,
      bookedRooms: c.bookedRooms,
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
  }, [cabinAvailability, tour]);

  useEffect(() => {
    if (!selectedRoom) return;

    const latestRoom = rooms.find((room) => room.id === selectedRoom.id);
    const bookedRooms = latestRoom?.bookedRooms ?? 0;
    if (
      !latestRoom ||
      latestRoom.availableRooms <= 0 ||
      (selectedRoom.selectedUnitIndex != null &&
        selectedRoom.selectedUnitIndex <= bookedRooms)
    ) {
      const timer = window.setTimeout(() => {
        setSelectedRoom(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [rooms, selectedRoom]);

  useEffect(() => {
    if (
      !bookingPrefill.classId ||
      !selectedSchedule?.id ||
      availabilityScheduleId !== selectedSchedule.id ||
      rooms.length === 0
    ) {
      return;
    }

    const key = `${selectedSchedule.id}:${bookingPrefill.classId}`;
    if (prefillRoomKeyRef.current === key) return;

    const selectedClass = tour?.classes?.find(
      (item) => item.id === bookingPrefill.classId,
    );
    const room = rooms.find(
      (item) =>
        item.id === bookingPrefill.classId ||
        (selectedClass &&
          item.name.toLowerCase() === selectedClass.name.toLowerCase()),
    );

    prefillRoomKeyRef.current = key;

    if (!room || room.availableRooms <= 0) {
      const timer = window.setTimeout(() => {
        setSelectedRoom(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const unitIndex = (room.bookedRooms ?? 0) + 1;
    const nextRoom = {
      ...room,
      selectedUnitIndex: unitIndex,
      selectedUnitLabel: `${room.name} ${unitIndex}`,
    };
    const timer = window.setTimeout(() => {
      setSelectedRoom(nextRoom);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    availabilityScheduleId,
    bookingPrefill.classId,
    rooms,
    selectedSchedule?.id,
    tour?.classes,
  ]);

  const tourServices = useMemo(() => tour?.services ?? [], [tour?.services]);
  const prefillServiceIds = bookingPrefill.serviceIds;

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const prefillServiceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tour) return;
    const key = `${tour.id}:${prefillServiceIds.join(',')}`;
    if (prefillServiceKeyRef.current === key) return;
    prefillServiceKeyRef.current = key;
    const validIds = new Set(tourServices.map((s) => s.id));
    setSelectedServiceIds(prefillServiceIds.filter((id) => validIds.has(id)));
  }, [prefillServiceIds, tour, tourServices]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedServices: TourServiceResponse[] = useMemo(() => {
    if (tourServices.length === 0 || selectedServiceIds.length === 0) return [];
    const serviceIds = new Set(selectedServiceIds);
    return tourServices.filter((service) => serviceIds.has(service.id));
  }, [selectedServiceIds, tourServices]);

  const hasRooms = rooms.length > 0;
  const hasServices = tourServices.length > 0;

  const basePrice = tour ? tour.price : 0;
  const tourPrice = basePrice * guests;
  const roomPrice = selectedRoom ? selectedRoom.price : 0;
  const servicePrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0,
  );
  const totalPrice = tourPrice + roomPrice + servicePrice;
  const maxGuests =
    selectedSchedule?.maxCapacity || tour?.classes?.[0]?.capacity || 50;

  // ── Step layout (dynamic) ──
  const stepKeys = useMemo(() => {
    const keys: Array<'date' | 'rooms' | 'services' | 'guests' | 'confirm'> = [
      'date',
    ];
    if (hasRooms) keys.push('rooms');
    if (hasServices) keys.push('services');
    keys.push('guests');
    keys.push('confirm');
    return keys;
  }, [hasRooms, hasServices]);

  const totalSteps = stepKeys.length;
  const currentStepKey = stepKeys[step - 1];

  useEffect(() => {
    if (step > totalSteps) setStep(totalSteps);
  }, [step, totalSteps]);

  // ── Handlers ──
  const canProceed = () => {
    switch (currentStepKey) {
      case 'date':
        return selectedSchedule !== null && !isAvailabilityLoading;
      case 'rooms':
        return !isAvailabilityLoading && selectedRoom !== null;
      case 'services':
        return true; // optional
      case 'guests':
        return guests >= 1 && guests <= maxGuests;
      default:
        return true;
    }
  };

  const handleNext = () => {
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
        className="text-[28px] font-bold text-foreground"
        style={{ letterSpacing: '-0.44px' }}
      >
        {t('booking.title')}
      </h1>
      <p className="mt-1 text-sm text-ddms-secondary">{tour.name}</p>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={step}
        hasRooms={hasRooms}
        hasServices={hasServices}
      />

      {/* Step Content */}
      <div
        className="mt-8 rounded-2xl p-6 sm:p-8 border"
        style={{
          backgroundColor: 'var(--ddms-bg-card)',
          borderColor: 'var(--border)',
          boxShadow:
            'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.05) 0px 4px 8px',
        }}
      >
        {currentStepKey === 'date' && (
          <StepDateTime
            schedules={schedules}
            selectedSchedule={selectedSchedule}
            onSelectSchedule={(sched) => {
              setSelectedSchedule(sched);
              setSelectedRoom(null);
            }}
          />
        )}

        {currentStepKey === 'rooms' && (
          <StepViewRooms
            rooms={rooms}
            selectedRoom={selectedRoom}
            selectedBoatName={selectedSchedule?.boatName || 'Du thuyền'}
            boatImageUrls={selectedSchedule?.boatImageUrls || []}
            isAvailabilityLoading={isAvailabilityLoading}
            onSelectRoom={setSelectedRoom}
          />
        )}

        {currentStepKey === 'services' && (
          <StepServices
            services={tourServices}
            selectedServiceIds={selectedServiceIds}
            onToggleService={toggleService}
          />
        )}

        {currentStepKey === 'guests' && (
          <StepGuests
            guests={guests}
            maxGuests={maxGuests}
            selectedRoom={selectedRoom}
            tourPrice={tourPrice}
            roomPrice={roomPrice}
            servicePrice={servicePrice}
            totalPrice={totalPrice}
            selectedServices={selectedServices}
            onSetGuests={setGuests}
            basePrice={basePrice}
          />
        )}

        {currentStepKey === 'confirm' && (
          <StepConfirm
            tour={tour}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedRoom={selectedRoom}
            guests={guests}
            tourPrice={tourPrice}
            roomPrice={roomPrice}
            servicePrice={servicePrice}
            totalPrice={totalPrice}
            selectedServices={selectedServices}
            selectedSchedule={selectedSchedule}
            onConfirm={handleConfirm}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            size="action-lg"
            className="flex-1 text-foreground border-foreground/30 hover:bg-foreground/5"
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
