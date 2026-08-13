import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { routeName } from '@/constants/route-name';
import { CyanAnimatedButton } from '@/components/common/CyanAnimatedButton';

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
        ? 'Front-row seats to Dragon Bridge fire show'
        : 'Vị trí tuyệt vời ngắm Cầu Rồng phun lửa',
    ],
  },
];

/**
 * Một ô ảnh trong lưới gallery.
 *
 * `emphasis` phân biệt ảnh chủ đạo với ảnh phụ: ảnh chủ đạo phủ gradient đậm
 * và chữ to hơn để mắt có điểm dừng đầu tiên, thay vì 4 ảnh đều nhau như cũ.
 */
function GalleryTile({
  src,
  alt,
  title,
  className = '',
  emphasis = false,
}: {
  src: string;
  alt: string;
  title: string;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`group bg-ddms-bg-card relative overflow-hidden rounded-[24px]
                  transition-all duration-300 hover:scale-[0.99] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform
                   duration-700 ease-out group-hover:scale-105"
      />
      <div
        className={`absolute inset-0 z-0 bg-linear-to-t to-transparent ${
          emphasis ? 'from-black/85 via-black/20' : 'from-black/70 via-black/10'
        }`}
      />
      <div className="absolute bottom-0 left-0 z-10 p-6">
        <h4
          className={`max-w-md leading-tight font-bold tracking-tight text-white ${
            emphasis ? 'text-lg md:text-xl' : 'text-base md:text-lg'
          }`}
        >
          {title}
        </h4>
      </div>
    </div>
  );
}

export default function FeaturedProviders() {
  const { t, i18n } = useTranslation();
  const providers = getProviders(i18n.language.toUpperCase());

  return (
    <div
      style={{
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-2 md:max-w-[80%]">
        <span className="text-ddms-secondary text-[11px] font-bold tracking-wider uppercase">
          {t('home.providers.sectionEyebrow')}
        </span>
        <h2 className="text-foreground mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          {t('home.providers.sectionTitle')}
        </h2>
      </div>

      {providers.map((p) => (
        <section key={p.id} className="bg-transparent py-12">
          <div className="mx-auto max-w-7xl px-6 md:max-w-[80%]">
            {/* Hàng 1: thẻ giới thiệu + ảnh chủ đạo */}
            <div className="mb-6 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
              {/* Chữ đặt trên thẻ nền sáng mờ, không nằm trần trên gradient
                  cyan của body — nền đó làm chữ nhỏ rất khó đọc ở light mode. */}
              {/* justify-center: ở md+ thẻ bị kéo cao bằng ảnh hero, canh giữa
                  để chữ không dồn lên đỉnh và bỏ trống nửa dưới. */}
              <div className="bg-ddms-bg-card border-border/80 flex flex-col justify-center rounded-[24px] border p-7">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="bg-ddms-accent text-foreground border-ddms-secondary/25 flex items-center
                               gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold
                               tracking-wider uppercase"
                  >
                    <svg
                      className="text-ddms-secondary h-3 w-3 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {t('home.providers.verified')}
                  </span>
                  <span className="text-foreground flex items-center gap-1 text-xs font-bold">
                    <Star
                      size={12}
                      fill="#ffc107"
                      style={{ color: '#ffc107' }}
                    />
                    {p.rating.toFixed(1)}
                  </span>
                </div>

                <span className="text-ddms-secondary text-[11px] font-bold tracking-wider uppercase">
                  {p.category}
                </span>
                <h3 className="text-foreground mt-1 mb-4 text-3xl leading-tight font-bold tracking-tight">
                  {p.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {p.description}
                </p>

                <Link
                  to={routeName.tours}
                  className="group text-ddms-secondary mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all"
                >
                  <span>{t('home.providers.viewFleets')}</span>
                  <svg
                    className="h-4 w-6.5 shrink-0 transition-transform duration-300 group-hover:translate-x-2"
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

              <GalleryTile
                src={p.images[0]}
                alt={`${p.name} Hero`}
                title={p.imageTitles[0]}
                emphasis
                className="h-80 md:col-span-2 md:h-110"
              />
            </div>

            {/* Hàng 2: ảnh rộng + ảnh hẹp */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-10">
              <GalleryTile
                src={p.images[1]}
                alt={`${p.name} Gallery 2`}
                title={p.imageTitles[1]}
                className="h-72 md:col-span-7 md:h-80"
              />
              <GalleryTile
                src={p.images[2]}
                alt={`${p.name} Gallery 3`}
                title={p.imageTitles[2]}
                className="h-72 md:col-span-3 md:h-80"
              />
            </div>

            {/* Hàng 3: ảnh rộng + thẻ đặt chỗ */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-10">
              <GalleryTile
                src={p.images[3]}
                alt={`${p.name} Gallery 4`}
                title={p.imageTitles[3]}
                className="h-72 md:col-span-7 md:h-80"
              />

              <div className="bg-ddms-bg-card border-border/80 group relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-6 shadow-md md:col-span-3">
                <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-cyan-500/5 to-blue-500/5 opacity-50" />
                <div className="z-10 space-y-2">
                  <span className="text-ddms-secondary block text-[10px] font-bold tracking-wider uppercase">
                    {t('home.providers.specialDeal')}
                  </span>
                  <h4 className="text-foreground text-xl leading-tight font-bold">
                    {t('home.providers.yachtTitle')}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed font-normal">
                    {t('home.providers.yachtDesc')}
                  </p>
                </div>

                <div className="z-10 mt-6 space-y-2">
                  <div className="text-foreground text-sm font-semibold">
                    ★ {p.rating.toFixed(1)}{' '}
                    <span className="text-muted-foreground text-xs">
                      ({p.totalReviews} {t('home.providers.reviews')})
                    </span>
                  </div>
                  <CyanAnimatedButton
                    to={routeName.tours}
                    className="rounded-xl py-2.5 text-xs"
                  >
                    {t('home.providers.bookNow')}
                  </CyanAnimatedButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
