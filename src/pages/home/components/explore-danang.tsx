import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useLanguage from '@/contexts/LanguageContext';
import { routeName } from '@/constants/route-name';

const getSpots = (language: string) => [
  {
    id: 'spot-1',
    title:
      language === 'EN'
        ? 'Dragon Bridge - Symbol of Prosperity & Aspiration'
        : 'Cầu Rồng - Biểu tượng khát vọng vươn mình ra biển lớn',
    description:
      language === 'EN'
        ? 'A state-of-the-art bridge designed in the shape of a magnificent Ly Dynasty dragon, famous for its breath-taking fire and water breathing show every weekend.'
        : 'Cây cầu độc đáo thiết kế mô phỏng hình dáng con rồng thời Lý mạnh mẽ hướng ra biển Đông, nổi tiếng với màn trình diễn phun lửa và nước ấn tượng dịp cuối tuần.',
    image:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'spot-2',
    title:
      language === 'EN'
        ? "Han River Bridge - Vietnam's First Swing Bridge"
        : 'Cầu Sông Hàn - Cây cầu quay đầu tiên của Việt Nam',
    description:
      language === 'EN'
        ? 'A proud landmark built by the local citizens, swinging 90 degrees at midnight to open the shipping lane for vessels to pass through.'
        : 'Biểu tượng tự hào được xây dựng bởi chính người dân Đà Nẵng, có khả năng quay 90 độ vào giữa đêm để mở đường cho các tàu thuyền lớn qua lại.',
    image:
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'spot-3',
    title:
      language === 'EN'
        ? 'Linh Ung Pagoda - Sacred Spirit of Son Tra Peninsula'
        : 'Chùa Linh Ứng - Linh khí thiêng liêng giữa bán đảo Sơn Trà',
    description:
      language === 'EN'
        ? 'A sacred sanctuary home to the tallest Lady Buddha statue in Vietnam (67m), offering peaceful spiritual journeys and vast ocean horizons.'
        : 'Ngôi chùa linh thiêng tựa lưng vào núi Sơn Trà, nơi có tượng Phật Bà Quan Âm cao 67m hướng ra biển cả cầu bình an cho ngư dân và thành phố.',
    image:
      'https://images.unsplash.com/photo-1621275471769-e6aa344546d5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'spot-4',
    title:
      language === 'EN'
        ? "My Khe Beach - One of the World's Most Beautiful Beaches"
        : 'Biển Mỹ Khê - Một trong những bãi biển quyến rũ nhất hành tinh',
    description:
      language === 'EN'
        ? 'Celebrated for its long stretch of white sand, warm waters all year round, gentle slopes, and stunning sunrise vistas over the East Sea.'
        : 'Nổi tiếng với bãi cát trắng mịn trải dài, làn nước trong xanh ấm áp quanh năm và là địa điểm ngắm bình minh trên biển Đông vô cùng thơ mộng.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function ExploreDaNang() {
  const { language } = useLanguage();
  const spots = getSpots(language);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % spots.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeIndex, spots.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + spots.length) % spots.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % spots.length);
  };

  const currentSpot = spots[activeIndex];

  return (
    <section
      id="explore-danang"
      className="w-full py-12 bg-background relative z-10"
    >
      <div className="w-full px-4 md:px-10">
        {/* Main Slider Container (Full Width stretching, taller height) */}
        <div className="relative w-full h-162.5 md:h-200 rounded-[32px] overflow-hidden group bg-ddms-bg-card">
          {/* Sliding Track for Horizontal Transition */}
          <div
            className="absolute inset-0 flex transition-transform duration-1000 ease-in-out z-0"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {spots.map((spot) => (
              <div key={spot.id} className="relative w-full h-full shrink-0">
                <img
                  src={spot.image}
                  alt={spot.title}
                  className="w-full h-full object-cover"
                />
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>

          {/* Left Dark Floating Overlay Card (Tall & Matching the Switzerland look) */}
          <div className="absolute top-12 bottom-12 left-6 md:left-12 w-[calc(100%-48px)] sm:w-125 bg-black/60 backdrop-blur-md rounded-[24px] p-8 md:p-12 flex flex-col justify-between z-10 transition-all duration-300">
            {/* key forces re-render on slide change to trigger css transitions */}
            <div
              key={activeIndex}
              className="animate-in fade-in slide-in-from-bottom-2 duration-700"
            >
              <span className="text-[11px] uppercase tracking-wider text-ddms-secondary font-bold mb-3 block">
                {language === 'EN' ? 'Top attractions' : 'Địa điểm nổi bật'}
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4 whitespace-pre-line">
                {currentSpot.title}
              </h3>
              <p className="text-sm md:text-base text-white/70 leading-relaxed font-light">
                {currentSpot.description}
              </p>
            </div>

            <Link
              to={routeName.tours}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary mt-8 transition-all shrink-0"
            >
              <svg
                className="w-10 h-6 text-ddms-secondary transition-transform duration-300 group-hover:translate-x-3 shrink-0"
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

          {/* Navigation controls (Bottom Right) */}
          <div className="absolute bottom-12 right-12 flex gap-3.5 z-10">
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white bg-black/45 hover:bg-black/60 hover:border-white transition-all active:scale-95 backdrop-blur-xs"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white bg-black/45 hover:bg-black/60 hover:border-white transition-all active:scale-95 backdrop-blur-xs"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
