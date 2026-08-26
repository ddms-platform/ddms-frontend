import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Ship, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { routeName } from '@/constants/route-name';
import {
  publicOwnerService,
  type FeaturedOwnerResponse,
} from '@/services/publicOwnerService';

const isUserId = (value?: string) =>
  !!value &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function ownerToursPath(owner: FeaturedOwnerResponse) {
  const params = new URLSearchParams();
  params.set('ownerId', owner.userId);
  params.set('ownerName', owner.name);
  return `${routeName.tours}?${params.toString()}`;
}

export default function FeaturedProviders() {
  const { t } = useTranslation();
  const [owners, setOwners] = useState<FeaturedOwnerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicOwnerService
      .getFeatured(3)
      .then((list) =>
        setOwners(
          list.filter((owner) => owner.tourCount > 0 && isUserId(owner.userId)),
        ),
      )
      .catch((error) => {
        console.error('Failed to fetch featured owners:', error);
        setOwners([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || owners.length === 0) return null;

  return (
    <section style={{ backgroundColor: 'var(--ddms-bg-main)' }}>
      <div className="mx-auto max-w-7xl px-6 py-16 md:max-w-[80%]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ddms-secondary">
          {t('home.providers.sectionEyebrow')}
        </span>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t('home.providers.sectionTitle')}
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((owner) => {
            if (!isUserId(owner.userId)) return null;
            const cover = owner.boatImages[0];
            return (
              <Link
                key={owner.id}
                to={ownerToursPath(owner)}
                className="group overflow-hidden rounded-[20px] border border-border/80 bg-ddms-bg-card shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px] transition-all duration-250 hover:-translate-y-1 hover:shadow-[rgba(0,0,0,0.12)_0_8px_24px]"
              >
                <div className="relative h-52 overflow-hidden bg-muted">
                  {cover ? (
                    <img
                      src={cover}
                      alt={owner.name}
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <Ship size={32} />
                    </div>
                  )}
                  <span className="absolute top-3.5 left-3.5 flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#222]">
                    <BadgeCheck size={12} className="text-ddms-secondary" />
                    {t('home.providers.verified')}
                  </span>
                </div>

                <div className="px-5 pt-4.5 pb-5">
                  <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-foreground">
                    {owner.name}
                  </h3>

                  {owner.avgRating != null ? (
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Star
                        size={13}
                        fill="#ffc107"
                        className="text-[#ffc107]"
                      />
                      {owner.avgRating.toFixed(1)}
                      <span className="font-normal text-muted-foreground">
                        ({owner.reviewCount} {t('home.providers.reviews')})
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('home.providers.noRating')}
                    </p>
                  )}

                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {owner.boatCount} {t('home.providers.boats')} ·{' '}
                    {owner.tourCount} {t('home.providers.tours')}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ddms-secondary">
                    {t('home.providers.viewTours')}
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
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
