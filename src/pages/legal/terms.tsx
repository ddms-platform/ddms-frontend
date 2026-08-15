import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          to={routeName.home}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('legal.backToHome', 'Quay lại Trang chủ')}
        </Link>

        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText size={14} />
            {t('legal.terms.badge', 'Văn bản pháp lý')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('legal.terms.title', 'Điều khoản dịch vụ')}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              'legal.lastUpdated',
              'Cập nhật lần cuối: 15/08/2026 · Áp dụng cho toàn bộ người dùng và đối tác trên DDMS',
            )}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-foreground/90 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                1
              </span>
              {t('legal.terms.sec1Title', 'Giới thiệu & Phạm vi áp dụng')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'legal.terms.sec1Desc',
                'Hệ thống Quản lý Bến du thuyền số Đà Nẵng (DDMS) cung cấp nền tảng kết nối trực tuyến giữa Hành khách du lịch và các Đơn vị vận hành tàu thuyền đã được cấp phép trên địa bàn TP. Đà Nẵng. Bằng việc truy cập hoặc sử dụng bất kỳ dịch vụ nào trên DDMS, bạn đồng ý tuân thủ toàn bộ các điều khoản và điều kiện được nêu tại đây.',
              )}
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                2
              </span>
              {t(
                'legal.terms.sec2Title',
                'Quy định Đặt tour & Thanh toán trực tuyến',
              )}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t(
                  'legal.terms.sec2Item1',
                  'Mọi giao dịch thanh toán trên hệ thống được xử lý bảo mật qua cổng thanh toán liên ngân hàng PayOS (hỗ trợ chuyển khoản QR VietQR, thẻ nội địa Napas và thẻ quốc tế).',
                )}
              </li>
              <li>
                {t(
                  'legal.terms.sec2Item2',
                  'Sau khi thanh toán thành công, hệ thống sẽ cấp mã Vé điện tử (QR Code) và gửi xác nhận qua Email/SMS của hành khách.',
                )}
              </li>
              <li>
                {t(
                  'legal.terms.sec2Item3',
                  'Giá vé hiển thị trên website là giá niêm yết chính thức đã bao gồm bảo hiểm hành khách theo quy định của Cục Đường thủy Nội địa Việt Nam.',
                )}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                3
              </span>
              {t('legal.terms.sec3Title', 'Quy định An toàn Hàng hải')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t(
                'legal.terms.sec3Desc',
                'Hành khách và Chủ tàu khi tham gia các chuyến tham quan trên sông Hàn và vịnh Đà Nẵng phải nghiêm túc chấp hành các quy định an toàn:',
              )}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t(
                  'legal.terms.sec3Item1',
                  'Hành khách bắt buộc phải mặc áo phao cứu sinh trong suốt quá trình thuyền rời bến theo chỉ dẫn của thuyền trưởng.',
                )}
              </li>
              <li>
                {t(
                  'legal.terms.sec3Item2',
                  'Nghiêm cấm mang theo chất cháy nổ, vũ khí hoặc chất cấm lên phương tiện thủy.',
                )}
              </li>
              <li>
                {t(
                  'legal.terms.sec3Item3',
                  'Hành khách có mặt tại Cảng khởi hành trước giờ xuất bến tối thiểu 15 phút để làm thủ tục check-in.',
                )}
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                4
              </span>
              {t(
                'legal.terms.sec4Title',
                'Trách nhiệm & Quyền lợi của Đối tác Chủ tàu',
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'legal.terms.sec4Desc',
                'Chủ tàu phải đảm bảo phương tiện luôn trong tình trạng kiểm định đăng kiểm còn hiệu lực, đầy đủ bằng thuyền trưởng/máy trưởng và trang thiết bị an toàn. DDMS có quyền tạm dừng hoặc thu hồi tài khoản đối tác nếu vi phạm quy chế an toàn cảng bến.',
              )}
            </p>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                5
              </span>
              {t(
                'legal.terms.sec5Title',
                'Bất khả kháng & Giải quyết tranh chấp',
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'legal.terms.sec5Desc',
                'Trong trường hợp thời tiết nguy hiểm (bão lũ, gió giật mạnh vượt ngưỡng cho phép) hoặc có lệnh cấm xuất bến từ Cảng vụ Hàng hải Đà Nẵng, chuyến đi sẽ được hoãn hoặc hoàn tiền 100% theo Chính sách huỷ tour của hệ thống.',
              )}
            </p>
          </section>
        </div>

        {/* Footer Support Notice */}
        <div className="mt-12 text-center rounded-2xl border border-border bg-muted/40 p-6">
          <ShieldCheck size={28} className="mx-auto text-cyan-500 mb-2" />
          <p className="text-sm text-foreground font-semibold">
            {t(
              'legal.contactQuestion',
              'Bạn có thắc mắc về Điều khoản dịch vụ?',
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t(
              'legal.contactEmail',
              'Vui lòng liên hệ Ban Quản Trị DDMS qua email support@ddms.vn hoặc hotline 1900 6868.',
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
