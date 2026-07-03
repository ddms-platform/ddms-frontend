import { Link } from 'react-router-dom';
import useLanguage from '@/contexts/LanguageContext';
import { routeName } from '@/constants/route-name';

export default function HowItWorks() {
  const { language } = useLanguage();

  return (
    <section
      id="summer-activities"
      className="py-20"
      style={{
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Row 1: Title & Large Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
          {/* Title & Description Block */}
          <div className="flex flex-col justify-between p-2">
            <div>
              <h2 className="text-[36px] md:text-[44px] font-bold leading-[1.1] text-white tracking-tight whitespace-pre-line">
                {language === 'EN'
                  ? 'Recommendation\nsummer activity'
                  : 'Gợi ý hoạt động\nmùa hè'}
              </h2>
              <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs font-light">
                {language === 'EN'
                  ? 'Explore the best aquatic sports, private cruises, and marine adventures Da Nang has to offer this summer season.'
                  : 'Trải nghiệm những hoạt động thể thao nước, du thuyền riêng tư và hành trình khám phá biển đảo Đà Nẵng tuyệt vời nhất mùa hè này.'}
              </p>
            </div>

            {/* Learn More link with sequential long arrow */}
            <Link
              to={routeName.tours}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary mt-8 transition-all"
            >
              <span>
                {language === 'EN'
                  ? 'Explore all activities'
                  : 'Khám phá tất cả'}
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

          {/* Card 1: Large landscape Yacht card */}
          <Link
            to={routeName.tours}
            className="md:col-span-2 group relative rounded-[24px] overflow-hidden h-80 md:h-100 transition-all duration-300 hover:scale-[0.99]"
          >
            <img
              src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1000&q=80"
              alt="Grand Yacht Tour of Da Nang"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent z-0" />

            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                {language === 'EN'
                  ? 'Grand Yacht Tour of Da Nang Bay'
                  : 'Hành trình du thuyền hạng sang quanh Vịnh Đà Nẵng'}
              </h3>
            </div>
          </Link>
        </div>

        {/* Row 2: Two Smaller Landscape Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 2: Snorkeling */}
          <Link
            to={routeName.tours}
            className="group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99]"
          >
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80"
              alt="Coral Reef Snorkeling"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent z-0" />

            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {language === 'EN'
                  ? 'Snorkeling & Coral Diving at Son Tra'
                  : 'Lặn ngắm san hô Bán đảo Sơn Trà'}
              </h3>
            </div>
          </Link>

          {/* Card 3: SUP Surf */}
          <Link
            to={routeName.tours}
            className="group relative rounded-[24px] overflow-hidden h-65 md:h-75 transition-all duration-300 hover:scale-[0.99]"
          >
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
              alt="Sunrise SUP Surf"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent z-0" />

            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {language === 'EN'
                  ? 'Sunrise SUP Paddling at My Khe Beach'
                  : 'Chèo ván SUP ngắm bình minh biển Mỹ Khê'}
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
