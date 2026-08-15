import { useTranslation } from 'react-i18next';
import {
  Compass,
  QrCode,
  Anchor,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  LifeBuoy,
  FileQuestion,
  Headphones,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';

export default function HelpCenterPage() {
  const { t } = useTranslation();

  const helpTopics = [
    {
      icon: Compass,
      title: t('help.topic1Title', 'Hướng dẫn Đặt tour & Chọn thuyền'),
      desc: t(
        'help.topic1Desc',
        'Cách tìm kiếm lịch trình phù hợp, xem thông số tàu, chọn số lượng hành khách và thanh toán vé an toàn qua PayOS.',
      ),
      link: routeName.tours,
      btnText: t('help.topic1Btn', 'Khám phá Tour'),
    },
    {
      icon: QrCode,
      title: t('help.topic2Title', 'Quy trình Check-in tại Cảng du thuyền'),
      desc: t(
        'help.topic2Desc',
        'Cách sử dụng mã QR Code vé điện tử để quét qua hệ thống Kiosk tự động tại bến Sông Hàn trước khi lên tàu.',
      ),
      link: routeName.faqs,
      btnText: t('help.topic2Btn', 'Xem hướng dẫn'),
    },
    {
      icon: Anchor,
      title: t('help.topic3Title', 'Cẩm nang Dành cho Chủ tàu'),
      desc: t(
        'help.topic3Desc',
        'Quy trình nộp hồ sơ đối tác, đăng ký phương tiện, tạo lịch khởi hành và quản lý ví doanh thu cảng bến.',
      ),
      link: routeName.becomeOwner,
      btnText: t('help.topic3Btn', 'Trở thành chủ thuyền'),
    },
    {
      icon: ShieldCheck,
      title: t('help.topic4Title', 'Chính sách An toàn & Hoàn vé'),
      desc: t(
        'help.topic4Desc',
        'Quy định an toàn hàng hải, chính sách hoàn tiền 100% khi thời tiết xấu hoặc quy định đổi lịch trình.',
      ),
      link: routeName.cancellationPolicy,
      btnText: t('help.topic4Btn', 'Xem chính sách'),
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <Link
          to={routeName.home}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('legal.backToHome', 'Quay lại Trang chủ')}
        </Link>

        {/* Page Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <LifeBuoy size={14} />
            {t('help.badge', 'Trung tâm trợ giúp')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('help.title', 'Chúng tôi có thể giúp gì cho bạn?')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {t(
              'help.subtitle',
              'Tra cứu cẩm nang hướng dẫn sử dụng nền tảng Bến du thuyền số Đà Nẵng (DDMS).',
            )}
          </p>
        </div>

        {/* 4 Topic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {helpTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-cyan-500/40 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 mb-5 group-hover:scale-105 transition-transform">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-cyan-600 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <Link
                    to={topic.link}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    <span>{topic.btnText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step by Step Booking Journey */}
        <div className="rounded-3xl border border-border bg-ddms-bg-card p-8 sm:p-12 mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">
            {t(
              'help.journeyTitle',
              'Hành trình 4 bước trải nghiệm tour trên DDMS',
            )}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            {t(
              'help.journeySubtitle',
              'Đặt vé và xuất bến dễ dàng chỉ trong vài phút với công nghệ quản lý số.',
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: t('help.step1Title', 'Tìm & Chọn tour'),
                desc: t(
                  'help.step1Desc',
                  'Xem giá niêm yết, thời gian khởi hành và hình ảnh du thuyền thật.',
                ),
              },
              {
                step: '02',
                title: t('help.step2Title', 'Thanh toán PayOS'),
                desc: t(
                  'help.step2Desc',
                  'Quét mã VietQR hoặc thẻ ngân hàng, tiền được giữ an toàn.',
                ),
              },
              {
                step: '03',
                title: t('help.step3Title', 'Nhận vé QR Code'),
                desc: t(
                  'help.step3Desc',
                  'Vé điện tử gửi về email và lưu trong tài khoản cá nhân.',
                ),
              },
              {
                step: '04',
                title: t('help.step4Title', 'Quét mã & Lên tàu'),
                desc: t(
                  'help.step4Desc',
                  'Check-in tại Kiosk cảng Sông Hàn và bắt đầu chuyến du ngoạn.',
                ),
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-border bg-background/50 relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-cyan-500/40 block mb-2 font-mono">
                    {st.step}
                  </span>
                  <h4 className="text-base font-bold text-foreground mb-1">
                    {st.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links / Support Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-ddms-bg-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                <FileQuestion size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t('help.faqBoxTitle', 'Câu hỏi thường gặp')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('help.faqBoxDesc', 'Giải đáp các thắc mắc phổ biến nhất')}
                </p>
              </div>
            </div>
            <Link
              to={routeName.faqs}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-foreground/5 transition-colors text-foreground"
            >
              {t('help.viewFaqBtn', 'Xem FAQs')}
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-ddms-bg-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Headphones size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t('help.contactBoxTitle', 'Hỗ trợ khách hàng')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('help.contactBoxDesc', 'Hotline 1900 6868 · 24/7')}
                </p>
              </div>
            </div>
            <Link
              to={routeName.contact}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              {t('help.contactBtn', 'Liên hệ ngay')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
