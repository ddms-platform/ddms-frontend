import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routeName } from '@/constants/route-name';
import { useAuth } from '@/hooks/use-auth';

interface Article {
  id: number;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
}

export default function CtaSection() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const mockArticles: Article[] = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600&auto=format&fit=crop&q=80',
      category: 'Cẩm nang du lịch',
      title: 'Top 5 Du Thuyền Sông Hàn Đáng Trải Nghiệm Nhất 2026',
      excerpt:
        'Khám phá danh sách những du thuyền sang trọng bậc nhất sông Hàn với dịch vụ ẩm thực đẳng cấp và lộ trình ngắm toàn cảnh Đà Nẵng về đêm.',
      date: '28 Tháng 6, 2026',
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      category: 'Kinh nghiệm',
      title: 'Ngắm Hoàng Hôn Sông Hàn: Khoảnh Khắc Lãng Mạn Không Thể Bỏ Lỡ',
      excerpt:
        'Kinh nghiệm săn góc chụp hình hoàng hôn triệu đô từ tầng thượng du thuyền và thời gian khởi hành lý tưởng nhất cho buổi tối lãng mạn.',
      date: '15 Tháng 6, 2026',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&auto=format&fit=crop&q=80',
      category: 'Tin tức mới',
      title:
        'Khai Trương Tuyến Du Lịch Đường Thủy Mới Kết Nối Đà Nẵng - Hội An',
      excerpt:
        'Thông tin chi tiết về tuyến hành trình đường thủy dọc sông Cổ Cò, hứa hẹn mở ra trải nghiệm du lịch văn hóa độc đáo mới giữa hai thành phố.',
      date: '10 Tháng 6, 2026',
    },
  ];

  if (isAuthenticated) {
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
              <Link to={routeName.tours}>
                Xem tất cả tin tức <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {mockArticles.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-ddms-bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-muted">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-ddms-primary/80 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-white">
                    {article.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-ddms-secondary leading-snug">
                      {article.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="opacity-80" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-ddms-secondary group-hover:underline">
                      Đọc thêm <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </article>
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
