import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  blogService,
  BLOG_CATEGORIES,
  type BlogPostListItem,
} from '@/services/blogService';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import { useAuth } from '@/hooks/use-auth';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600&auto=format&fit=crop&q=80';

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(value))
    : '';

export default function CtaSection() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<BlogPostListItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    blogService
      .getPosts({ page: 1, pageSize: 3 })
      .then((res) => {
        if (active) setArticles(res.items ?? []);
      })
      .catch((error) => {
        // Chua co bai nao thi an khoi di, khong dung du lieu mau.
        console.error('Failed to fetch blog posts:', error);
        if (active) setArticles([]);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (isAuthenticated && articles.length > 0) {
    return (
      <section className="py-20 bg-transparent relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-linear-to-tr from-cyan-400/10 to-blue-500/5 blur-3xl opacity-40 pointer-events-none z-0" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="mb-12 text-center md:text-left md:flex md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2
                className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                style={{ letterSpacing: '-0.44px' }}
              >
                Cẩm nang & Tin tức Đường thủy
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Cập nhật các câu chuyện du hành lý thú, cẩm nang du lịch và
                thông tin mới nhất về dịch vụ du thuyền, sông nước Đà Nẵng.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-6 md:mt-0 gap-2 border-border text-foreground hover:bg-foreground/5 cursor-pointer font-semibold rounded-xl"
              asChild
            >
              <Link to={routeName.blogList}>
                Xem tất cả tin tức <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/tin-tuc/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-ddms-bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-muted">
                  <img
                    src={article.coverImageUrl || FALLBACK_COVER}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-ddms-primary/80 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-white">
                    {BLOG_CATEGORIES[article.category] ?? article.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-ddms-secondary leading-snug">
                      {article.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="opacity-80" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-ddms-secondary group-hover:underline">
                      Đọc thêm <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Thẻ gradient xanh biển với dải sóng chạy ở đáy — điểm nhấn cuối trang.
  return (
    <section id="cta" className="mx-auto max-w-7xl px-6 py-16 md:py-22">
      <div className="relative overflow-hidden rounded-[32px] bg-linear-120 from-[#0e2a38] via-[#14547a] to-[#1f93b8] px-6 py-16 text-center text-white md:px-12 md:py-17">
        <div className="ddms-wave-deco pointer-events-none absolute inset-x-0 -bottom-1.5 h-17.5 opacity-25" />

        <div className="relative">
          <h2 className="mb-3.5 text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.6px]">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto mb-7.5 max-w-135 text-base opacity-85">
            {t('home.cta.description')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="action-lg"
              className="rounded-3xl bg-ddms-primary px-8 text-base text-white shadow-[rgba(255,56,92,0.3)_0_4px_14px] hover:bg-[#e00b41]"
              asChild
            >
              <Link to={routeName.signUp}>{t('home.cta.signUp')}</Link>
            </Button>
            <Button
              variant="outline"
              size="action-lg"
              className="rounded-3xl border-2 border-white/40 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link to={routeName.tours}>{t('home.cta.explore')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
