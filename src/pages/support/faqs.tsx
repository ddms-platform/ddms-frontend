import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ArrowLeft,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { routeName } from '@/constants/route-name';

interface FaqItem {
  id: string;
  category: 'booking' | 'experience' | 'owner' | 'safety';
  question: string;
  answer: string;
}

const FAQS_DATA: FaqItem[] = [
  {
    id: 'f1',
    category: 'booking',
    question: 'Tôi có thể thanh toán vé du thuyền bằng những hình thức nào?',
    answer:
      'DDMS hỗ trợ thanh toán an toàn 100% qua cổng PayOS, bao gồm quét mã QR chuyển khoản nhanh (VietQR từ tất cả ngân hàng), thẻ ATM nội địa Napas, ví điện tử và thẻ quốc tế Visa / MasterCard.',
  },
  {
    id: 'f2',
    category: 'booking',
    question: 'Sau khi đặt vé thành công, tôi nhận vé điện tử bằng cách nào?',
    answer:
      'Hệ thống sẽ tự động gửi email xác nhận kèm Mã vé QR Code vào hòm thư điện tử của bạn. Bạn cũng có thể xem lại vé bất cứ lúc nào trong mục "Chuyến đi của tôi" trên website.',
  },
  {
    id: 'f3',
    category: 'booking',
    question: 'Trẻ em đi tour du thuyền có cần mua vé riêng không?',
    answer:
      'Theo quy định: Trẻ em dưới 1 mét được miễn phí vé (ngồi cùng người lớn). Trẻ em từ 1m đến 1m3 áp dụng giá vé trẻ em (giảm 30% - 50% tuỳ tàu). Trẻ em trên 1m3 áp dụng giá vé người lớn.',
  },
  {
    id: 'f4',
    category: 'experience',
    question: 'Tôi cần có mặt tại cảng trước giờ xuất bến bao lâu?',
    answer:
      'Hành khách nên có mặt tại Cảng du thuyền Sông Hàn (đường Bạch Đằng) trước giờ khởi hành tối thiểu 15 - 20 phút để nhân viên hỗ trợ quét mã QR check-in qua Kiosk và hướng dẫn lên tàu an toàn.',
  },
  {
    id: 'f5',
    category: 'experience',
    question: 'Tour du thuyền sông Hàn có phục vụ ăn uống không?',
    answer:
      'Hầu hết các tour ngắm cảnh sông Hàn tiêu chuẩn đều phục vụ miễn phí nước suối, trái cây tươi và xem múa Chăm pa truyền thống. Ngoài ra, bạn có thể chọn các gói "Tour Ăn Tối Trên Tàu" để thưởng thức tiệc ẩm thực đặc sản miền Trung.',
  },
  {
    id: 'f6',
    category: 'safety',
    question: 'Nếu trời mưa hoặc có bão thì chuyến đi xử lý thế nào?',
    answer:
      'Trong trường hợp thời tiết mưa to, gió giật hoặc Cảng vụ Hàng hải cấm xuất bến vì lý do an toàn, DDMS sẽ thông báo cho bạn và hỗ trợ: 1. Đổi sang ngày đi khác miễn phí; hoặc 2. Hoàn tiền 100% về tài khoản của bạn trong 24 - 48 giờ.',
  },
  {
    id: 'f7',
    category: 'safety',
    question: 'Tôi có được mang theo thú cưng hoặc đồ ăn ngoài lên tàu không?',
    answer:
      'Vì lý do an toàn và vệ sinh chung, hành khách không được mang thú cưng lên tàu du lịch công cộng. Đồ ăn nhẹ và nước ngọt được phép mang theo, tuy nhiên không mang đồ uống có cồn nồng độ cao hoặc chất dễ cháy nổ.',
  },
  {
    id: 'f8',
    category: 'owner',
    question:
      'Làm thế nào để tôi đưa du thuyền của mình vào hoạt động trên DDMS?',
    answer:
      'Bạn chỉ cần nhấp vào nút "Trở thành chủ thuyền" trên thanh menu, hoàn tất biểu mẫu thông tin doanh nghiệp/cá nhân và tải lên giấy đăng kiểm, chứng nhận an toàn kỹ thuật của tàu. Ban Quản Trị Cảng sẽ xét duyệt trong vòng 24 giờ làm việc.',
  },
  {
    id: 'f9',
    category: 'owner',
    question: 'Phí dịch vụ cảng và hoa hồng trên DDMS là bao nhiêu?',
    answer:
      'Hệ thống áp dụng mức phí hoa hồng minh bạch 8% cho mỗi booking thành công trên sàn và phí thuê bến neo đậu theo biểu giá niêm yết của Cảng Đà Nẵng. Doanh thu được tự động quyết toán vào Ví chủ tàu định kỳ.',
  },
];

export default function FaqsPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['f1', 'f4', 'f6']);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((item) => {
      const matchCat =
        activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

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
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle size={14} />
            {t('faqs.badge', 'Trung tâm giải đáp')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('faqs.title', 'Câu hỏi thường gặp (FAQs)')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {t(
              'faqs.subtitle',
              'Tìm kiếm câu trả lời nhanh chóng cho các thắc mắc về đặt vé, trải nghiệm tour và hợp tác chủ tàu.',
            )}
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'faqs.searchPlaceholder',
                'Nhập từ khoá tìm câu hỏi (ví dụ: vé trẻ em, huỷ vé, thanh toán...)...',
              )}
              className="w-full rounded-2xl border border-border bg-ddms-bg-card pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-cyan-500 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-none">
          {[
            { key: 'all', label: t('faqs.catAll', 'Tất cả câu hỏi') },
            {
              key: 'booking',
              label: t('faqs.catBooking', 'Đặt vé & Thanh toán'),
            },
            {
              key: 'experience',
              label: t('faqs.catExperience', 'Trải nghiệm trên tàu'),
            },
            { key: 'safety', label: t('faqs.catSafety', 'An toàn & Hoàn huỷ') },
            { key: 'owner', label: t('faqs.catOwner', 'Đối tác Chủ thuyền') },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'border border-border bg-ddms-bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-border bg-ddms-bg-card transition-all overflow-hidden shadow-2xs hover:border-cyan-500/40"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-foreground text-sm sm:text-base cursor-pointer gap-4"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-border bg-ddms-bg-card p-12 text-center">
              <p className="text-muted-foreground text-sm">
                {t(
                  'faqs.noResults',
                  'Không tìm thấy câu hỏi phù hợp với từ khoá của bạn.',
                )}
              </p>
            </div>
          )}
        </div>

        {/* AI Concierge / Contact Helper Banner */}
        <div className="mt-12 rounded-2xl border border-cyan-500/30 bg-linear-to-r from-cyan-500/10 via-blue-500/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {t('faqs.aiHelperTitle', 'Vẫn chưa tìm thấy câu trả lời?')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t(
                  'faqs.aiHelperDesc',
                  'Chat ngay với Trợ lý AI Trip Concierge ở góc màn hình hoặc gửi tin nhắn cho Ban Quản trị.',
                )}
              </p>
            </div>
          </div>
          <Link
            to={routeName.contact}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 text-sm font-bold shadow-sm transition-all shrink-0"
          >
            <MessageSquare size={16} />
            {t('faqs.contactBtn', 'Liên hệ Hỗ trợ')}
          </Link>
        </div>
      </div>
    </div>
  );
}
