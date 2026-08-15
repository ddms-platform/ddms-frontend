import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Ship, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { routeName } from '@/constants/route-name';
import {
  publicOwnerService,
  type FeaturedOwnerResponse,
} from '@/services/publicOwnerService';

/**
 * Ô ảnh trong lưới. Chỉ nhận ảnh tàu thật của chủ thuyền — trước đây khối này
 * dùng ảnh Unsplash kèm tên công ty bịa và điểm đánh giá bịa.
 */
function GalleryTile({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[20px] border border-border/60 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}

/** Lưới ảnh co giãn theo số ảnh thật sự có (1–4 tấm). */
function BoatGallery({ images, name }: { images: string[]; name: string }) {
  if (images.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-border text-muted-foreground md:col-span-2">
        <Ship size={28} />
        <span className="text-xs">—</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <GalleryTile
        src={images[0]}
        alt={name}
        className="h-64 md:col-span-2 md:h-96"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:col-span-2">
      <GalleryTile
        src={images[0]}
        alt={name}
        className={
          images.length === 2 ? 'h-48 md:h-96' : 'row-span-2 h-64 md:h-96'
        }
      />
      {images.slice(1, 3).map((src, i) => (
        <GalleryTile
          key={src + i}
          src={src}
          alt={name}
          className={images.length === 2 ? 'h-48 md:h-96' : 'h-30 md:h-[184px]'}
        />
      ))}
    </div>
  );
}

export default function FeaturedProviders() {
  const { t } = useTranslation();
  const [owners, setOwners] = useState<FeaturedOwnerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicOwnerService
      .getFeatured(3)
      .then(setOwners)
      .catch((error) => {
        console.error('Failed to fetch featured owners:', error);
        setOwners([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Chưa có chủ thuyền nào được duyệt thì ẩn hẳn khối, không dựng chỗ trống.
  if (loading || owners.length === 0) return null;

  return (
    <div style={{ backgroundColor: 'var(--ddms-bg-main)' }}>
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-2 md:max-w-[80%]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ddms-secondary">
          {t('home.providers.sectionEyebrow')}
        </span>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('home.providers.sectionTitle')}
        </h2>
      </div>

      {owners.map((owner) => (
        <section key={owner.id} className="bg-transparent py-10">
          <div className="mx-auto max-w-7xl px-6 md:max-w-[80%]">
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
              <div className="flex flex-col justify-center rounded-[24px] border border-border/80 bg-ddms-bg-card p-7">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full border border-ddms-secondary/25 bg-ddms-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                    <BadgeCheck size={12} className="text-ddms-secondary" />
                    {t('home.providers.verified')}
                  </span>

                  {owner.avgRating !== null && owner.avgRating !== undefined ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-foreground">
                      <Star size={12} fill="#ffc107" color="#ffc107" />
                      {owner.avgRating.toFixed(1)}
                      <span className="font-normal text-muted-foreground">
                        ({owner.reviewCount} {t('home.providers.reviews')})
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t('home.providers.noRating')}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-ddms-secondary">
                  {t(`ownerRegistration.entityTypes.${owner.entityType}`)}
                </span>
                <h3 className="mb-3 mt-1 text-3xl font-bold leading-tight tracking-tight text-foreground">
                  {owner.name}
                </h3>

                {owner.bio && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {owner.bio}
                  </p>
                )}

                <p className="mt-4 text-sm font-semibold text-foreground">
                  {owner.boatCount} {t('home.providers.boats')} ·{' '}
                  {owner.tourCount} {t('home.providers.tours')}
                </p>

                <Link
                  to={routeName.tours}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary transition-all"
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

              <BoatGallery images={owner.boatImages} name={owner.name} />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
