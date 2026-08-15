import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ContactPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error(
        t('contact.fillRequired', 'Vui lòng điền đầy đủ các trường bắt buộc.'),
      );
      return;
    }

    setSending(true);
    // Simulate sending message to support
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success(
        t(
          'contact.sendSuccess',
          'Cảm ơn bạn! Tin nhắn của bạn đã được gửi tới Ban Quản Trị DDMS.',
        ),
      );
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

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

        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Mail size={14} />
            {t('contact.badge', 'Liên hệ & Hỗ trợ')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('contact.title', 'Liên hệ Ban Quản Trị DDMS')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {t(
              'contact.subtitle',
              'Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ du khách, chủ tàu và đối tác 24/7.',
            )}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards & Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address */}
            <div className="p-6 rounded-2xl border border-border bg-ddms-bg-card shadow-xs flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('contact.addressTitle', 'Trụ sở & Cảng khởi hành')}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Cảng du thuyền Sông Hàn, Đường Bạch Đằng, Phường Thạch Thang,
                  Quận Hải Châu, TP. Đà Nẵng
                </p>
              </div>
            </div>

            {/* Hotline */}
            <div className="p-6 rounded-2xl border border-border bg-ddms-bg-card shadow-xs flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('contact.hotlineTitle', 'Hotline hỗ trợ 24/7')}
                </h3>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  1900 6868 · 0236 3888 999
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    'contact.hotlineDesc',
                    'Tư vấn đặt vé, kiểm tra thời tiết',
                  )}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="p-6 rounded-2xl border border-border bg-ddms-bg-card shadow-xs flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('contact.emailTitle', 'Hòm thư điện tử')}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  support@ddms.vn · bqt@ddms.danang.gov.vn
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="p-6 rounded-2xl border border-border bg-ddms-bg-card shadow-xs flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('contact.hoursTitle', 'Thời gian mở cảng')}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  07:00 - 23:00 (Tất cả các ngày trong tuần, kể cả Lễ & Tết)
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-ddms-bg-card p-6 sm:p-8 shadow-md">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('contact.formTitle', 'Gửi tin nhắn cho chúng tôi')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t(
                  'contact.formSubtitle',
                  'Điền thông tin vào mẫu bên dưới, chúng tôi sẽ phản hồi trong vòng 30 phút.',
                )}
              </p>

              {sent ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <CheckCircle2
                    size={36}
                    className="mx-auto text-emerald-500 mb-2"
                  />
                  <h3 className="text-base font-bold text-foreground">
                    {t('contact.successTitle', 'Đã gửi tin nhắn thành công!')}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(
                      'contact.successMsg',
                      'Đội ngũ hỗ trợ DDMS sẽ liên hệ với bạn trong thời gian sớm nhất.',
                    )}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSent(false)}
                  >
                    {t('contact.sendAnother', 'Gửi tin nhắn khác')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                        {t('contact.name', 'Họ và tên')}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                        {t('contact.email', 'Email')}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                        {t('contact.phone', 'Số điện thoại')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0905 123 456"
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                        {t('contact.subject', 'Chủ đề')}
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                      >
                        <option value="">
                          {t('contact.selectSubject', 'Chọn chủ đề liên hệ...')}
                        </option>
                        <option value="booking">
                          {t(
                            'contact.subjBooking',
                            'Hỏi về Đặt vé & Chuyến đi',
                          )}
                        </option>
                        <option value="owner">
                          {t(
                            'contact.subjOwner',
                            'Hợp tác Đối tác / Đăng ký tàu',
                          )}
                        </option>
                        <option value="refund">
                          {t('contact.subjRefund', 'Hỗ trợ Huỷ vé & Hoàn tiền')}
                        </option>
                        <option value="feedback">
                          {t(
                            'contact.subjFeedback',
                            'Góp ý chất lượng dịch vụ',
                          )}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                      {t('contact.message', 'Nội dung tin nhắn')}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t(
                        'contact.messagePlaceholder',
                        'Vui lòng mô tả chi tiết yêu cầu của bạn để chúng tôi hỗ trợ tốt nhất...',
                      )}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="cyan"
                    size="action"
                    disabled={sending}
                    className="w-full font-semibold gap-2"
                  >
                    <Send size={16} />
                    {sending
                      ? t('contact.sending', 'Đang gửi tin nhắn...')
                      : t('contact.sendBtn', 'Gửi tin nhắn ngay')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
