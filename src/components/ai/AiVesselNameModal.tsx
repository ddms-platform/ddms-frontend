import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Wand2,
  Loader2,
  Check,
  X,
  Ship,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '@/services/aiService';
import {
  cleanVesselName,
  getVesselNamingExample,
  generateLocalFallbackVesselNames,
} from '@/lib/vessel-naming';

interface AiVesselNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  vesselType: string;
  vesselTypeName?: string;
  currentName?: string;
  onSelectName: (name: string) => void;
}

const POPULAR_THEMES = [
  'Sông Hàn',
  'Sơn Trà',
  'Biển Đông',
  'Cù Lao Chàm',
  'Hoàng Gia',
  'Poseidon',
  'Đại Dương',
];

export default function AiVesselNameModal({
  isOpen,
  onClose,
  vesselType,
  vesselTypeName,
  currentName,
  onSelectName,
}: AiVesselNameModalProps) {
  const { t } = useTranslation();
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Khởi tạo từ khóa khi mở modal
  useEffect(() => {
    if (isOpen) {
      setKeywords(currentName?.trim() || '');
      // Tự động sinh nếu chưa có options
      if (options.length === 0) {
        handleGenerate(currentName?.trim() || '');
      }
    }
  }, [isOpen, vesselType]);

  const handleGenerate = async (customKw?: string) => {
    setLoading(true);
    const targetKeywords =
      typeof customKw === 'string' ? customKw : keywords.trim();

    try {
      const res = await aiService.generateOwnerContent({
        type: 'vessel_name',
        keywords: targetKeywords || vesselTypeName || vesselType || 'du thuyền',
        serviceType: vesselTypeName || vesselType || 'du thuyền',
        tourName: currentName || undefined,
      });

      let nameList = (res.options ?? []).filter(
        (opt) => !/AI CHƯA|VUI LÒNG|KHÔNG THỂ|CHƯA ĐƯỢC|THỬ LẠI/i.test(opt),
      );

      // Fallback nếu options rỗng mà có text
      if (nameList.length === 0 && res.text) {
        nameList = res.text
          .split(/\r?\n/)
          .map((l) =>
            l
              .replace(/^\s*(?:\d+[.)\-\s]|[-*•]\s)+/, '')
              .replace(/\*+/g, '')
              .trim(),
          )
          .filter(
            (l) =>
              l.length >= 3 &&
              l.length <= 80 &&
              !/AI CHƯA|VUI LÒNG|KHÔNG THỂ|CHƯA ĐƯỢC|THỬ LẠI/i.test(l),
          )
          .slice(0, 5);
      }

      if (nameList.length === 0) {
        nameList = generateLocalFallbackVesselNames(
          targetKeywords,
          vesselTypeName || vesselType,
        );
      }

      setOptions(nameList.map(cleanVesselName));
    } catch {
      // Khi mất mạng hoặc API lỗi, tự động dùng thuật toán nội bộ tạo 5 tên đẹp
      const fallbackList = generateLocalFallbackVesselNames(
        targetKeywords,
        vesselTypeName || vesselType,
      );
      setOptions(fallbackList.map(cleanVesselName));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (name: string) => {
    const cleaned = cleanVesselName(name);
    onSelectName(cleaned);
    toast.success(
      t('aiVesselModal.applied', 'Đã áp dụng tên du thuyền: {{name}}', {
        name: cleaned,
      }),
    );
    onClose();
  };

  const handleCopy = (name: string, index: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleAddKeywordTag = (tag: string) => {
    if (!keywords.includes(tag)) {
      const newKw = keywords ? `${keywords}, ${tag}` : tag;
      setKeywords(newKw);
      handleGenerate(newKw);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-ddms-bg-card p-6 shadow-2xl transition-all"
        style={{ backgroundColor: 'var(--ddms-bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-tr from-ddms-secondary/20 to-ddms-secondary/10 text-ddms-secondary">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t('aiVesselModal.title', 'AI Gợi ý Tên Du Thuyền ✨')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(
                  'aiVesselModal.subtitle',
                  'Chuẩn thương hiệu & quy chuẩn đăng kiểm hàng hải',
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          {/* Vessel Type Badge & Example */}
          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-ddms-bg-main/60 px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ship size={15} className="text-ddms-secondary" />
              <span>{t('aiVesselModal.vesselType', 'Loại phương tiện')}:</span>
              <strong className="text-foreground">
                {vesselTypeName ||
                  vesselType ||
                  t('aiVesselModal.defaultType', 'Du thuyền')}
              </strong>
            </div>
            <span className="text-[11px] text-muted-foreground italic">
              {getVesselNamingExample(vesselType)}
            </span>
          </div>

          {/* Keyword Input & Theme Pills */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t(
                'aiVesselModal.keywordsLabel',
                'Ý tưởng / Từ khóa phong cách (tùy chọn):',
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder={t(
                  'aiVesselModal.keywordsPlaceholder',
                  'VD: Hoàng Gia, Poseidon, Biển Xanh, Sơn Trà...',
                )}
                className="h-10 flex-1 rounded-lg border border-border bg-ddms-bg-main px-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ddms-secondary"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-ddms-secondary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wand2 size={14} />
                )}
                <span>{t('aiVesselModal.generateBtn', 'Sáng tạo')}</span>
              </button>
            </div>

            {/* Quick theme tags */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                {t('aiVesselModal.popularThemes', 'Chủ đề nhanh:')}
              </span>
              {POPULAR_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleAddKeywordTag(theme)}
                  className="rounded-md border border-border bg-ddms-bg-main/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:border-ddms-secondary/40 hover:text-ddms-secondary transition-colors cursor-pointer"
                >
                  +{theme}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                {t('aiVesselModal.suggestionsTitle', 'Gợi ý từ Gemini AI:')}
              </span>
              {options.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  className="flex items-center gap-1 text-[11px] text-ddms-secondary hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>{t('aiVesselModal.regenerate', 'Tạo gợi ý khác')}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 rounded-xl border border-dashed border-border bg-ddms-bg-main/30">
                <Loader2
                  size={24}
                  className="animate-spin text-ddms-secondary"
                />
                <p className="text-xs font-medium text-foreground">
                  {t(
                    'aiVesselModal.loadingText',
                    'AI đang sáng tạo tên tàu chuẩn quốc tế & đăng kiểm hàng hải...',
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    'aiVesselModal.loadingSubtext',
                    'Đang tối ưu theo loại phương tiện & phong cách',
                  )}
                </p>
              </div>
            ) : options.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between rounded-xl border border-border bg-ddms-bg-main/50 p-3 transition-all hover:border-ddms-secondary hover:bg-ddms-secondary/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 items-center justify-center rounded-md bg-foreground/10 text-xs font-bold text-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold tracking-wide text-foreground group-hover:text-ddms-secondary transition-colors">
                        {opt}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(opt, idx)}
                        title={t('aiVesselModal.copy', 'Sao chép')}
                        className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <Check size={13} className="text-green-500" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelect(opt)}
                        className="rounded-lg bg-ddms-secondary/15 px-2.5 py-1 text-xs font-medium text-ddms-secondary hover:bg-ddms-secondary hover:text-white transition-colors cursor-pointer"
                      >
                        {t('aiVesselModal.applyBtn', 'Chọn tên này')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                {t(
                  'aiVesselModal.noOptions',
                  'Nhập từ khóa và bấm "Sáng tạo" để nhận gợi ý tên.',
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 border-t border-border pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {t(
              'aiVesselModal.footerHint',
              '💡 Tên tàu sẽ tự động chuẩn hóa IN HOA và loại bỏ ký tự lạ.',
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            {t('aiVesselModal.close', 'Đóng')}
          </button>
        </div>
      </div>
    </div>
  );
}
