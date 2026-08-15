import { useTranslation } from 'react-i18next';
import { Shield, Lock, ArrowLeft, Eye, Database, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';

export default function PrivacyPolicyPage() {
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
            <Lock size={14} />
            {t('legal.privacy.badge', 'Bảo mật thông tin')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('legal.privacy.title', 'Chính sách bảo mật')}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              'legal.lastUpdated',
              'Cập nhật lần cuối: 15/08/2026 · Cam kết bảo vệ quyền riêng tư người dùng DDMS',
            )}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-foreground/90 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Eye size={20} className="text-cyan-500" />
              {t('legal.privacy.sec1Title', '1. Dữ liệu chúng tôi thu thập')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t(
                'legal.privacy.sec1Desc',
                'Khi bạn đăng ký tài khoản, đặt tour hoặc đăng ký trở thành đối tác chủ thuyền trên DDMS, chúng tôi thu thập các thông tin cần thiết nhằm phục vụ hoạt động vận hành cảng bến:',
              )}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t(
                  'legal.privacy.sec1Item1',
                  'Thông tin cá nhân: Họ tên, địa chỉ email, số điện thoại, ảnh đại diện.',
                )}
              </li>
              <li>
                {t(
                  'legal.privacy.sec1Item2',
                  'Thông tin khai báo hành khách: Danh sách người đi cùng, số CCCD/Hộ chiếu (phục vụ bảo hiểm du lịch đường thủy theo quy định nhà nước).',
                )}
              </li>
              <li>
                {t(
                  'legal.privacy.sec1Item3',
                  'Thông tin đối tác chủ tàu: Giấy đăng kiểm, giấy phép kinh doanh vận tải thủy, bằng thuyền trưởng/máy trưởng.',
                )}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Database size={20} className="text-cyan-500" />
              {t('legal.privacy.sec2Title', '2. Mục đích sử dụng thông tin')}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                {t(
                  'legal.privacy.sec2Item1',
                  'Xác thực và xuất vé điện tử, tạo mã check-in qua Kiosk tại cảng du thuyền Sông Hàn.',
                )}
              </li>
              <li>
                {t(
                  'legal.privacy.sec2Item2',
                  'Gửi thông báo trạng thái đặt vé, thông báo lịch trình xuất bến hoặc cảnh báo thời tiết bất thường.',
                )}
              </li>
              <li>
                {t(
                  'legal.privacy.sec2Item3',
                  'Cung cấp thông tin hành khách cho Ban Quản lý Cảng vụ và Đơn vị Bảo hiểm Hàng hải khi có yêu cầu kiểm tra.',
                )}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield size={20} className="text-cyan-500" />
              {t(
                'legal.privacy.sec3Title',
                '3. Cam kết bảo mật & An toàn dữ liệu',
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'legal.privacy.sec3Desc',
                'Chúng tôi áp dụng các tiêu chuẩn bảo mật mã hóa SSL/TLS 256-bit trong mọi giao dịch truyền tải dữ liệu. Dữ liệu thẻ thanh toán của bạn hoàn toàn không được lưu trữ trực tiếp trên hệ thống DDMS mà do cổng thanh toán PayOS được cấp chứng chỉ bảo mật quốc tế PCI-DSS trực tiếp xử lý.',
              )}
            </p>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Bell size={20} className="text-cyan-500" />
              {t('legal.privacy.sec4Title', '4. Quyền lợi của người dùng')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'legal.privacy.sec4Desc',
                'Bạn có quyền truy cập, chỉnh sửa thông tin cá nhân trong trang Hồ sơ cá nhân bất cứ lúc nào, hoặc yêu cầu xóa tài khoản và dữ liệu liên quan khi không còn nhu cầu sử dụng dịch vụ bằng cách liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.',
              )}
            </p>
          </section>
        </div>

        {/* Footer Support Notice */}
        <div className="mt-12 text-center rounded-2xl border border-border bg-muted/40 p-6">
          <Shield size={28} className="mx-auto text-cyan-500 mb-2" />
          <p className="text-sm text-foreground font-semibold">
            {t(
              'legal.privacyContactTitle',
              'Bảo mật thông tin của bạn là ưu tiên hàng đầu tại DDMS',
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
