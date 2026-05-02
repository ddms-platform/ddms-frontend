import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Ship,
  Anchor,
  MapPin,
  Star,
  ChevronRight,
  Gauge,
  Shield,
  Waves,
  Calendar,
  ArrowLeft,
  DoorOpen,
} from 'lucide-react';
import Breadcrumb from '@/components/shared/breadcrumb';
import { StatusBadge } from '@/components/badges';
import ImageCarousel from '@/components/shared/image-carousel';

interface BoatSpec {
  icon: React.ElementType;
  label: string;
  value: string;
}

interface BoatAmenity {
  icon: string;
  label: string;
}

const MOCK_BOATS_DATA: Record<
  string,
  {
    id: string;
    name: string;
    type: string;
    capacity: number;
    image: string;
    available: boolean;
    description: string;
    longDescription: string;
    yearBuilt: number;
    length: string;
    speed: string;
    rating: number;
    totalTrips: number;
    images: string[];
    amenities: BoatAmenity[];
    captain: { name: string; experience: string; avatar: string };
    schedule: { day: string; time: string }[];
  }
> = {
  'boat-1': {
    id: 'boat-1',
    name: 'Rồng Vàng',
    type: 'cruise',
    capacity: 40,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=675&fit=crop',
    available: true,
    description: 'Du thuyền hạng sang với 2 tầng, phòng VIP',
    longDescription:
      'Rồng Vàng là du thuyền hạng sang nhất tại bến Bạch Đằng, Đà Nẵng. Với thiết kế 2 tầng hiện đại, phòng VIP riêng biệt và hệ thống âm thanh cao cấp, Rồng Vàng mang đến trải nghiệm du ngoạn sông Hàn đẳng cấp nhất. Tầng trên là khu vực ngoài trời với view 360 độ, lý tưởng để ngắm cầu Rồng phun lửa. Tầng dưới là không gian máy lạnh sang trọng với quầy bar phục vụ.',
    yearBuilt: 2022,
    length: '25m',
    speed: '12 knots',
    rating: 4.9,
    totalTrips: 1250,
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=675&fit=crop',
      'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=1200&h=675&fit=crop',
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&h=675&fit=crop',
    ],
    amenities: [
      { icon: '🍸', label: 'Quầy bar' },
      { icon: '🎵', label: 'Âm thanh hi-fi' },
      { icon: '❄️', label: 'Máy lạnh' },
      { icon: '🛟', label: 'Áo phao' },
      { icon: '📸', label: 'Khu chụp ảnh' },
      { icon: '🪑', label: 'Ghế ngoài trời' },
    ],
    captain: {
      name: 'Nguyễn Văn Hải',
      experience: '15 năm kinh nghiệm',
      avatar: '',
    },
    schedule: [
      { day: 'Thứ 2 - Thứ 6', time: '17:30, 19:00, 20:30' },
      { day: 'Thứ 7 - CN', time: '10:00, 15:00, 17:30, 19:00, 20:30' },
    ],
  },
  'boat-2': {
    id: 'boat-2',
    name: 'Sông Hàn 01',
    type: 'standard',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&h=675&fit=crop',
    available: true,
    description: 'Thuyền tiêu chuẩn, thoáng mát',
    longDescription:
      'Sông Hàn 01 là lựa chọn phổ biến nhất cho du khách muốn trải nghiệm tour sông Hàn với chi phí hợp lý. Thuyền được thiết kế mở, thoáng mát với mái che chống nắng mưa. Phù hợp cho các nhóm gia đình và bạn bè.',
    yearBuilt: 2021,
    length: '18m',
    speed: '10 knots',
    rating: 4.7,
    totalTrips: 2100,
    images: [
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&h=675&fit=crop',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=675&fit=crop',
    ],
    amenities: [
      { icon: '🛟', label: 'Áo phao' },
      { icon: '☂️', label: 'Mái che' },
      { icon: '🪑', label: 'Ghế ngồi thoải mái' },
      { icon: '🔊', label: 'Loa thuyết minh' },
    ],
    captain: {
      name: 'Trần Minh Đức',
      experience: '10 năm kinh nghiệm',
      avatar: '',
    },
    schedule: [{ day: 'Hàng ngày', time: '17:30, 19:00, 20:30' }],
  },
  'boat-3': {
    id: 'boat-3',
    name: 'Phượng Hoàng',
    type: 'luxury',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&h=675&fit=crop',
    available: false,
    description: 'Du thuyền cao cấp, nội thất sang trọng',
    longDescription:
      'Phượng Hoàng là du thuyền cao cấp nhất với nội thất sang trọng, ghế da cao cấp và dịch vụ phục vụ 5 sao. Hiện đang trong quá trình bảo trì nâng cấp nội thất và sẽ sớm quay lại phục vụ.',
    yearBuilt: 2023,
    length: '22m',
    speed: '14 knots',
    rating: 4.95,
    totalTrips: 450,
    images: [
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&h=675&fit=crop',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&h=675&fit=crop',
    ],
    amenities: [
      { icon: '🍸', label: 'Quầy bar cao cấp' },
      { icon: '🎵', label: 'Nhạc sống' },
      { icon: '❄️', label: 'Máy lạnh' },
      { icon: '🛟', label: 'Áo phao' },
      { icon: '🍽️', label: 'Phục vụ ăn uống' },
      { icon: '💎', label: 'Nội thất da cao cấp' },
    ],
    captain: {
      name: 'Lê Thanh Sơn',
      experience: '20 năm kinh nghiệm',
      avatar: '',
    },
    schedule: [],
  },
  'boat-4': {
    id: 'boat-4',
    name: 'Bạch Đằng Star',
    type: 'party',
    capacity: 50,
    image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&h=675&fit=crop',
    available: true,
    description: 'Thuyền tiệc lớn, sân khấu ngoài trời',
    longDescription:
      'Bạch Đằng Star là thuyền tiệc lớn nhất tại Đà Nẵng, sở hữu sân khấu ngoài trời và hệ thống âm thanh ánh sáng chuyên nghiệp. Lý tưởng cho các sự kiện, tiệc sinh nhật, team building và các buổi tiệc ngoài trời trên sông.',
    yearBuilt: 2020,
    length: '30m',
    speed: '8 knots',
    rating: 4.8,
    totalTrips: 890,
    images: [
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&h=675&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=675&fit=crop',
    ],
    amenities: [
      { icon: '🎤', label: 'Sân khấu' },
      { icon: '🎵', label: 'DJ booth' },
      { icon: '💡', label: 'Đèn LED' },
      { icon: '🍸', label: 'Quầy bar' },
      { icon: '🛟', label: 'Áo phao' },
      { icon: '🎉', label: 'Trang trí sự kiện' },
    ],
    captain: {
      name: 'Phạm Quốc Tuấn',
      experience: '12 năm kinh nghiệm',
      avatar: '',
    },
    schedule: [{ day: 'Thứ 6 - CN', time: '19:00, 21:00' }],
  },
  'boat-5': {
    id: 'boat-5',
    name: 'Cá Chép Đỏ',
    type: 'standard',
    capacity: 25,
    image: 'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=1200&h=675&fit=crop',
    available: false,
    description: 'Đang bảo trì định kỳ',
    longDescription:
      'Cá Chép Đỏ là thuyền tiêu chuẩn phù hợp cho các nhóm vừa. Hiện đang trong quá trình bảo trì định kỳ để đảm bảo an toàn và chất lượng dịch vụ tốt nhất.',
    yearBuilt: 2019,
    length: '16m',
    speed: '10 knots',
    rating: 4.6,
    totalTrips: 1800,
    images: ['https://images.unsplash.com/photo-1559599746-8823b38544c6?w=1200&h=675&fit=crop'],
    amenities: [
      { icon: '🛟', label: 'Áo phao' },
      { icon: '☂️', label: 'Mái che' },
      { icon: '🪑', label: 'Ghế ngồi' },
    ],
    captain: {
      name: 'Võ Đình Phúc',
      experience: '8 năm kinh nghiệm',
      avatar: '',
    },
    schedule: [],
  },
  'boat-6': {
    id: 'boat-6',
    name: 'Hải Âu',
    type: 'speedboat',
    capacity: 12,
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&h=675&fit=crop',
    available: true,
    description: 'Ca nô cao tốc, trải nghiệm mạo hiểm',
    longDescription:
      'Hải Âu là ca nô cao tốc mang đến trải nghiệm mạo hiểm và phấn khích trên sông Hàn. Với tốc độ cao và sự linh hoạt, Hải Âu phù hợp cho những ai yêu thích cảm giác mạnh và muốn khám phá sông Hàn một cách nhanh chóng.',
    yearBuilt: 2024,
    length: '10m',
    speed: '35 knots',
    rating: 4.85,
    totalTrips: 320,
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&h=675&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=675&fit=crop',
    ],
    amenities: [
      { icon: '🛟', label: 'Áo phao' },
      { icon: '🏎️', label: 'Tốc độ cao' },
      { icon: '🌊', label: 'Trải nghiệm sóng' },
    ],
    captain: {
      name: 'Huỳnh Anh Khoa',
      experience: '7 năm kinh nghiệm',
      avatar: '',
    },
    schedule: [{ day: 'Hàng ngày', time: '09:00, 11:00, 14:00, 16:00' }],
  },
};

export default function BoatDetailPage() {
  const { t } = useTranslation();
  const { boatId } = useParams();
  const boat = MOCK_BOATS_DATA[boatId || ''];

  if (!boat) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
        >
          <Ship size={40} style={{ color: '#EF4444' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
          {t('boatDetail.notFound')}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#ecf0ff' }}>
          {t('boatDetail.notFoundDesc')}
        </p>
        <Link
          to="/tours"
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: '#00F0FF', color: '#0A192F' }}
        >
          <ArrowLeft size={16} />
          {t('boatDetail.backToTours')}
        </Link>
      </div>
    );
  }

  const boatTypeLabel =
    boat.type === 'cruise'
      ? t('booking.boat.types.cruise')
      : boat.type === 'luxury'
        ? t('booking.boat.types.luxury')
        : boat.type === 'party'
          ? t('booking.boat.types.party')
          : boat.type === 'speedboat'
            ? t('booking.boat.types.speedboat')
            : t('booking.boat.types.standard');

  const specs: BoatSpec[] = [
    {
      icon: Users,
      label: t('boatDetail.specs.capacity'),
      value: `${boat.capacity} ${t('booking.guests.people')}`,
    },
    { icon: Gauge, label: t('boatDetail.specs.speed'), value: boat.speed },
    { icon: Anchor, label: t('boatDetail.specs.length'), value: boat.length },
    { icon: Calendar, label: t('boatDetail.specs.yearBuilt'), value: `${boat.yearBuilt}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.tours'), to: '/tours' },
          { label: boat.name },
        ]}
      />

      {/* Hero Gallery */}
      <div className="mt-4">
        <ImageCarousel
          images={boat.images}
          getAltText={(i) => `${boat.name} - ${t('tour.gallery.photo')} ${i + 1}`}
        />
      </div>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[28px] font-bold"
              style={{ color: '#ffffff', letterSpacing: '-0.44px' }}
            >
              {boat.name}
            </h1>
            <span
              className="rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: 'rgba(0,240,255,0.12)', color: '#00F0FF' }}
            >
              {boatTypeLabel}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: '#ecf0ff' }}>
            <MapPin size={15} />
            Bến Bạch Đằng, Đà Nẵng
          </p>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge
            label={boat.available ? t('booking.boat.available') : t('booking.boat.unavailable')}
            variant={boat.available ? 'available' : 'unavailable'}
          />
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ backgroundColor: '#112240' }}
          >
            <Star size={16} fill="#FFD700" style={{ color: '#FFD700' }} />
            <span className="text-base font-bold" style={{ color: '#ffffff' }}>
              {boat.rating}
            </span>
            <span className="text-xs" style={{ color: '#ecf0ff' }}>
              ({boat.totalTrips} {t('boatDetail.trips')})
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {specs.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#112240' }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05))',
              }}
            >
              <Icon size={20} style={{ color: '#00F0FF' }} />
            </div>
            <span className="mt-2.5 text-xs font-medium" style={{ color: '#ecf0ff' }}>
              {label}
            </span>
            <span className="mt-0.5 text-sm font-bold" style={{ color: '#ffffff' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Description */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#112240' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {t('boatDetail.about')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#ecf0ff' }}>
              {boat.longDescription}
            </p>
          </div>

          {/* Amenities */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#112240' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {t('boatDetail.amenities')}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {boat.amenities.map((amenity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'rgba(0,240,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-lg">{amenity.icon}</span>
                  <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                    {amenity.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          {boat.schedule.length > 0 && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#112240' }}>
              <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                {t('boatDetail.schedule')}
              </h2>
              <div className="mt-4 space-y-3">
                {boat.schedule.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl p-3"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                      {s.day}
                    </span>
                    <span className="text-sm" style={{ color: '#00F0FF' }}>
                      {s.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Captain Card */}
          <div
            className="sticky top-24 space-y-6 rounded-2xl p-6"
            style={{
              backgroundColor: '#112240',
              boxShadow:
                'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            }}
          >
            {/* Captain */}
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#ecf0ff' }}>
                {t('boatDetail.captain')}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00F0FF, #00d4e0)',
                    color: '#0A192F',
                  }}
                >
                  {boat.captain.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#ffffff' }}>
                    {boat.captain.name}
                  </p>
                  <p className="text-xs" style={{ color: '#ecf0ff' }}>
                    {boat.captain.experience}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* Safety */}
            <div
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ backgroundColor: 'rgba(52,211,153,0.08)' }}
            >
              <Shield size={20} style={{ color: '#34D399' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#34D399' }}>
                  {t('boatDetail.safety')}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {t('boatDetail.safetyDesc')}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
              >
                <Waves size={18} className="mx-auto" style={{ color: '#00F0FF' }} />
                <p className="mt-1 text-lg font-bold" style={{ color: '#ffffff' }}>
                  {boat.totalTrips.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {t('boatDetail.totalTrips')}
                </p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgba(0,240,255,0.05)' }}
              >
                <Star size={18} className="mx-auto" fill="#FFD700" style={{ color: '#FFD700' }} />
                <p className="mt-1 text-lg font-bold" style={{ color: '#ffffff' }}>
                  {boat.rating}
                </p>
                <p className="text-xs" style={{ color: '#ecf0ff' }}>
                  {t('boatDetail.rating')}
                </p>
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

            {/* CTA */}
            {boat.available ? (
              <div className="space-y-3">
                <Link
                  to={`/boats/${boat.id}/rooms`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-center text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: '#00F0FF', color: '#0A192F' }}
                >
                  <DoorOpen size={16} />
                  {t('boatDetail.viewRooms')}
                </Link>
                <Link
                  to="/tours"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border py-3.5 text-center text-sm font-medium transition-all hover:shadow-md active:scale-[0.98]"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
                >
                  {t('boatDetail.bookWithBoat')}
                  <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              <div
                className="rounded-lg py-3.5 text-center text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#ecf0ff' }}
              >
                {t('boatDetail.currentlyUnavailable')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
