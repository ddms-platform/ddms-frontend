import { useTranslation } from 'react-i18next';
import {
  RotateCcw,
  Clock,
  CloudRain,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';

export default function CancellationPolicyPage() {
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
            <RotateCcw size={14} />
            {t('legal.cancellation.badge', 'Chính sách hoàn huỷ')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('legal.cancellation.title', 'Chính sách huỷ tour & Hoàn tiền')}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              'legal.lastUpdated',
              'Cập nhật lần cuối: 15/08/2026 · Áp dụng cho các tour du thuyền đường thuỷ nội địa trên DDMS',
            )}
          </p>
        </div>

        {/* Highlight Summary Card */}
        <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6 sm:p-8">
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-cyan-500 shrink-0" />
            {t(
              'legal.cancellation.highlightTitle',
              'Quy tắc huỷ tour linh hoạt',
            )}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(
              'legal.cancellation.highlightDesc',
              'DDMS cam kết bảo vệ quyền lợi tối đa cho du khách với chính sách hoàn tiền 100% khi thời tiết bất lợi hoặc khi huỷ vé trước thời hạn quy định của từng nhà tàu.',
            )}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-foreground/90 leading-relaxed text-sm sm:text-base">
          {/* Section 1: Cancellation Timeline */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock size={20} className="text-cyan-500" />
              {t(
                'legal.cancellation.sec1Title',
                '1. Mức hoàn tiền theo thời gian huỷ vé của khách hàng',
              )}
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background/50 gap-2">
                <div>
                  <span className="font-semibold text-foreground">
                    {t(
                      'legal.cancellation.time1',
                      'Huỷ trước giờ khởi hành > 24 tiếng',
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      'legal.cancellation.time1Desc',
                      'Áp dụng cho mọi tour du thuyền tiêu chuẩn',
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {t('legal.cancellation.refund100', 'Hoàn 100% tiền vé')}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background/50 gap-2">
                <div>
                  <span className="font-semibold text-foreground">
                    {t(
                      'legal.cancellation.time2',
                      'Huỷ trước giờ khởi hành từ 12 - 24 tiếng',
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      'legal.cancellation.time2Desc',
                      'Phí giữ chỗ và chuẩn bị hậu cần',
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  {t('legal.cancellation.refund50', 'Hoàn 50% tiền vé')}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background/50 gap-2">
                <div>
                  <span className="font-semibold text-foreground">
                    {t(
                      'legal.cancellation.time3',
                      'Huỷ trước giờ khởi hành < 12 tiếng hoặc vắng mặt',
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      'legal.cancellation.time3Desc',
                      'Tàu đã xuất bến và hoàn tất thủ tục đăng ký danh sách khách',
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  {t('legal.cancellation.refund0', 'Không hoàn tiền')}
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Weather & Force Majeure */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <CloudRain size={20} className="text-cyan-500" />
              {t(
                'legal.cancellation.sec2Title',
                '2. Huỷ chuyến do Thời tiết & Bất khả kháng (Cảng vụ cấm xuất bến)',
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t(
                'legal.cancellation.sec2Desc',
                'An toàn của du khách luôn là ưu tiên cao nhất. Trong trường hợp mưa bão, gió lớn hoặc có lệnh cấm xuất bến chính thức từ Cảng vụ Hàng hải / Ban Quản lý Bến du thuyền Đà Nẵng:',
              )}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t(
                  'legal.cancellation.sec2Item1',
                  'Du khách được hỗ trợ đổi ngày đi miễn phí sang bất kỳ ngày nào khác còn lịch trống.',
                )}
              </li>
              <li>
                {t(
                  'legal.cancellation.sec2Item2',
                  'Nếu du khách không thể đổi lịch, hệ thống sẽ tự động hoàn trả 100% số tiền đã thanh toán trong vòng 24 - 48 giờ làm việc.',
                )}
              </li>
            </ul>
          </section>

          {/* Section 3: Refund Process */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <RotateCcw size={20} className="text-cyan-500" />
              {t(
                'legal.cancellation.sec3Title',
                '3. Quy trình & Thời gian hoàn tiền',
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t(
                'legal.cancellation.sec3Desc',
                'Số tiền hoàn lại sẽ được chuyển thẳng về tài khoản ngân hàng hoặc thẻ thanh toán mà bạn đã sử dụng khi đặt vé:',
              )}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t(
                  'legal.cancellation.sec3Item1',
                  'Thanh toán qua VietQR / Chuyển khoản nội địa: Hoàn tiền trong 1 - 2 ngày làm việc.',
                )}
              </li>
              <li>
                {t(
                  'legal.cancellation.sec3Item2',
                  'Thẻ Visa / MasterCard quốc tế: Hoàn tiền trong 5 - 7 ngày làm việc tùy thuộc vào ngân hàng phát hành thẻ.',
                )}
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Support Notice */}
        <div className="mt-12 text-center rounded-2xl border border-border bg-muted/40 p-6">
          <AlertTriangle size={28} className="mx-auto text-amber-500 mb-2" />
          <p className="text-sm text-foreground font-semibold">
            {t(
              'legal.cancellationNeedHelp',
              'Cần hỗ trợ huỷ chuyến hoặc đổi lịch gấp?',
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
