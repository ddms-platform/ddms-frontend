import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import useLanguage from '@/contexts/LanguageContext';
import { routeName } from '@/constants/route-name';

const getProviders = (language: string) => [
  {
    id: 'prov-1',
    name:
      language === 'EN' ? 'Danang Yacht Club' : 'Câu lạc bộ Du thuyền Đà Nẵng',
    category: language === 'EN' ? 'Luxury Yachts' : 'Du thuyền Hạng Sang',
    description:
      language === 'EN'
        ? 'Experience the ultimate luxury ocean voyages on our flagship catamarans and private yachts with experienced captains.'
        : 'Trải nghiệm du ngoạn biển khơi sang trọng và đẳng cấp bậc nhất trên các dòng du thuyền hai thân và du thuyền cá nhân cao cấp.',
    rating: 4.9,
    totalReviews: 124,
    images: [
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621275471769-e6aa344546d5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    ],
    imageTitles: [
      language === 'EN'
        ? 'Luxury yacht charters & private cruises'
        : 'Dịch vụ du thuyền cá nhân cao cấp',
      language === 'EN'
        ? 'Premium interior lounge & custom routes'
        : 'Không gian nội thất sang trọng & lịch trình riêng',
      language === 'EN' ? 'Relaxing sun decks' : 'Khoang phơi nắng thư giãn',
      language === 'EN'
        ? 'Pristine snorkeling bays'
        : 'Khám phá các vịnh biển nguyên sơ',
      language === 'EN'
        ? 'Ocean breeze & sunset views'
        : 'Ngắm hoàng hôn lãng mạn trên biển',
      language === 'EN'
        ? 'Five-star dining setup on board'
        : 'Trải nghiệm ẩm thực 5 sao giữa khơi xa',
    ],
  },
  {
    id: 'prov-2',
    name:
      language === 'EN' ? 'Han River Cruise Co.' : 'Hãng Tàu Du Lịch Sông Hàn',
    category: language === 'EN' ? 'River Cruises' : 'Tàu Du Lịch Sông Hàn',
    description:
      language === 'EN'
        ? 'Daily scenic Han River bridge cruises showing the fire dragon show, bridges lights, and delicious fine dining experiences.'
        : 'Hành trình thưởng ngoạn sông Hàn về đêm lung linh, ngắm Cầu Rồng phun lửa và thưởng thức ẩm thực đặc sắc trên du thuyền gỗ.',
    rating: 4.8,
    totalReviews: 342,
    images: [
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    ],
    imageTitles: [
      language === 'EN'
        ? 'Sparkling Han River night excursions'
        : 'Hành trình du thuyền đêm sông Hàn lung linh',
      language === 'EN'
        ? 'Open-air sky deck view of the city'
        : 'Khung cảnh thành phố rực rỡ từ boong ngoài trời',
      language === 'EN'
        ? 'Live cultural music shows'
        : 'Biểu diễn nghệ thuật truyền thống',
      language === 'EN'
        ? 'Delectable local seafood cuisine'
        : 'Thưởng thức ẩm thực sông nước đặc sắc',
      language === 'EN'
        ? 'Da Nang bridges light show up close'
        : 'Chiêm ngưỡng những cây cầu ánh sáng cự ly gần',
      language === 'EN'
        ? 'Front-row seats to Dragon Bridge fire show'
        : 'Vị trí tuyệt vời ngắm Cầu Rồng phun lửa',
    ],
  },
];

export default function FeaturedProviders() {
  const { language } = useLanguage();
  const providers = getProviders(language);

  return (
    <div
      style={{
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-8">
        <h2 className="text-[32px] font-bold leading-tight text-white tracking-tight">
          {language === 'EN' ? 'Featured Providers' : 'Nhà cung cấp nổi bật'}
        </h2>
        <p className="mt-2 text-sm text-white/70">
          {language === 'EN'
            ? 'Discover top-rated luxury charters, cruise operators, and water sports clubs in Da Nang'
            : 'Trải nghiệm dịch vụ đẳng cấp từ các câu lạc bộ du thuyền, hãng tàu du lịch hàng đầu Đà Nẵng'}
        </p>
      </div>

      {providers.map((p) => (
        <section key={p.id} className="py-16 bg-transparent">
          <div className="mx-auto max-w-7xl px-6">
            {/* Row 1: Text info & Image 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
              <div className="flex flex-col justify-between p-2">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/35 px-2.5 py-1 rounded-full font-bold">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {language === 'EN'
                        ? 'Verified Partner'
                        : 'Đối tác tin cậy'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-white/90">
                      <Star
                        size={12}
                        fill="#ffc107"
                        style={{ color: '#ffc107' }}
                      />
                      {p.rating.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-[11px] uppercase tracking-wider text-ddms-secondary font-bold">
                    {p.category}
                  </span>
                  <h3 className="text-3xl font-bold text-white tracking-tight mt-1 mb-4 leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-light">
                    {p.description}
                  </p>
                </div>

                <Link
                  to={routeName.tours}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary mt-8 transition-all"
                >
                  <span>
                    {language === 'EN'
                      ? 'View active fleets'
                      : 'Xem các tàu hoạt động'}
                  </span>
                  <svg
                    className="w-6.5 h-4 transition-transform duration-300 group-hover:translate-x-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Hero Image 1 */}
              <div className="md:col-span-2 group relative rounded-[24px] overflow-hidden h-80 md:h-95 transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card">
                <img
                  src={p.images[0]}
                  alt={`${p.name} Hero`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight max-w-lg">
                    {p.imageTitles[0]}
                  </h4>
                </div>
              </div>
            </div>

            {/* Row 2: Image 2 (7) & Image 3 (3) */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6 mb-6">
              <div className="md:col-span-7 group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card">
                <img
                  src={p.images[1]}
                  alt={`${p.name} Gallery 2`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight max-w-md">
                    {p.imageTitles[1]}
                  </h4>
                </div>
              </div>
              <div className="md:col-span-3 group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card">
                <img
                  src={p.images[2]}
                  alt={`${p.name} Gallery 3`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h4 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">
                    {p.imageTitles[2]}
                  </h4>
                </div>
              </div>
            </div>

            {/* Row 3: Image 4 (3) & Image 5 (7) */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6 mb-6">
              <div className="md:col-span-3 group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card">
                <img
                  src={p.images[3]}
                  alt={`${p.name} Gallery 4`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h4 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">
                    {p.imageTitles[3]}
                  </h4>
                </div>
              </div>
              <div className="md:col-span-7 group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card">
                <img
                  src={p.images[4]}
                  alt={`${p.name} Gallery 5`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight max-w-md">
                    {p.imageTitles[4]}
                  </h4>
                </div>
              </div>
            </div>

            {/* Row 4: Image 6 (7) & CTA Booking Card (3) */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-7 group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99] bg-ddms-bg-card">
                <img
                  src={p.images[5]}
                  alt={`${p.name} Gallery 6`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent z-0" />
                <div className="absolute bottom-0 left-0 p-6 z-10">
                  <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight max-w-md">
                    {p.imageTitles[5]}
                  </h4>
                </div>
              </div>

              {/* CTA Card */}
              <div className="md:col-span-3 rounded-[24px] p-6 flex flex-col justify-between bg-ddms-bg-card/40 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-blue-500/5 opacity-50 z-0 pointer-events-none" />
                <div className="z-10 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-ddms-secondary font-bold block">
                    {language === 'EN' ? 'Special Deal' : 'Ưu đãi đặt sớm'}
                  </span>
                  <h4 className="text-xl font-bold text-white leading-tight">
                    {language === 'EN'
                      ? 'Private Yacht Charter'
                      : 'Đặt chỗ trực tiếp'}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    {language === 'EN'
                      ? 'Book custom itinerary cruises with verified captains.'
                      : 'Liên hệ đặt hải trình riêng tư thiết kế theo sở thích.'}
                  </p>
                </div>

                <div className="z-10 mt-6 space-y-2">
                  <div className="text-sm font-semibold text-white/90">
                    ★ {p.rating.toFixed(1)}{' '}
                    <span className="text-xs text-white/50">
                      ({p.totalReviews}{' '}
                      {language === 'EN' ? 'reviews' : 'đánh giá'})
                    </span>
                  </div>
                  <Link
                    to={routeName.tours}
                    className="block text-center w-full py-2.5 rounded-xl text-xs font-bold text-black bg-white hover:bg-white/90 active:scale-95 transition-all z-10"
                  >
                    {language === 'EN' ? 'Book Now' : 'Liên hệ ngay'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
