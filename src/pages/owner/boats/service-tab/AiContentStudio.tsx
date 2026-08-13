import { useState } from 'react';
import { Sparkles, Wand2, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { aiService, type FaqItem } from '@/services/aiService';
import type { ServiceFormState } from '../service-tab';

interface AiContentStudioProps {
  service: ServiceFormState;
  onApplyName: (name: string) => void;
  onApplyDescription: (description: string) => void;
  onApplyFaqs: (faqs: FaqItem[]) => void;
  onApplyPrice: (price: string) => void;
}

type Panel =
  | { kind: 'idle' }
  | { kind: 'loading'; label: string }
  | { kind: 'names'; options: string[] }
  | { kind: 'description'; text: string }
  | { kind: 'faqs'; items: FaqItem[] }
  | { kind: 'price'; text: string; suggested?: number | null };

export default function AiContentStudio({
  service,
  onApplyName,
  onApplyDescription,
  onApplyFaqs,
  onApplyPrice,
}: AiContentStudioProps) {
  const [keywords, setKeywords] = useState('');
  const [panel, setPanel] = useState<Panel>({ kind: 'idle' });

  // Ô keyword trống thì lấy tên/mô tả đã điền sẵn làm ngữ cảnh —
  // người dùng thường gõ thẳng vào "Tên dịch vụ / Tour" rồi bấm nút AI.
  const effectiveKeywords = (): string =>
    keywords.trim() || service.name.trim() || service.description.trim();

  const requireKeywords = (type?: string): boolean => {
    const kw = effectiveKeywords();
    // For "name", need at least 3 chars context — too short → AI khó sáng tạo tốt
    if (type === 'name' && kw.length < 3) {
      toast.error(
        'Nhập ít nhất 3 ký tự keyword hoặc điền tên tour. VD: "sông Hàn, hoàng hôn, 2h"',
      );
      return false;
    }
    if (!kw) {
      toast.error('Nhập keywords hoặc điền sẵn tên/mô tả để AI có ngữ cảnh.');
      return false;
    }
    return true;
  };

  const run = async (
    type: 'name' | 'description' | 'faqs' | 'price',
    label: string,
  ) => {
    if (!requireKeywords(type)) return;
    setPanel({ kind: 'loading', label });
    try {
      const res = await aiService.generateOwnerContent({
        type,
        keywords: effectiveKeywords(),
        tourName: service.name || undefined,
        description: service.description || undefined,
        serviceType: service.serviceType,
        durationMinutes: undefined,
      });
      if (type === 'name') {
        let options = res.options ?? [];
        // Fallback: if BE parse returned empty but raw text has content, split by lines
        if (options.length === 0 && res.text) {
          options = res.text
            .split(/\r?\n/)
            .map((l) =>
              l
                .replace(/^\s*(?:\d+[.)\-\s]|[-*•]\s)+/, '')
                .replace(/\*+/g, '')
                .trim(),
            )
            .filter((l) => l.length >= 3 && l.length <= 120)
            .slice(0, 5);
        }
        if (options.length === 0) {
          toast.error(
            'AI chưa trả về tên phù hợp. Thử keywords cụ thể hơn (VD: "sông Hàn, hoàng hôn, gia đình").',
          );
          setPanel({ kind: 'idle' });
          return;
        }
        setPanel({ kind: 'names', options });
      } else if (type === 'description') {
        setPanel({ kind: 'description', text: res.text ?? '' });
      } else if (type === 'faqs') {
        const items = res.faqs ?? [];
        if (items.length === 0) {
          toast.error('AI chưa sinh được FAQ. Thêm mô tả để AI có ngữ cảnh.');
          setPanel({ kind: 'idle' });
          return;
        }
        setPanel({ kind: 'faqs', items });
      } else if (type === 'price') {
        setPanel({
          kind: 'price',
          text: res.text ?? '',
          suggested: res.suggestedPrice,
        });
      }
    } catch (err) {
      console.error('AI generate failed:', err);
      toast.error('AI đang bận. Vui lòng thử lại sau vài giây.');
      setPanel({ kind: 'idle' });
    }
  };

  const applyName = (name: string) => {
    onApplyName(name);
    toast.success(`Đã áp dụng tên: ${name}`);
    setPanel({ kind: 'idle' });
  };

  const applyDescription = (text: string) => {
    onApplyDescription(text);
    toast.success('Đã áp dụng mô tả AI.');
    setPanel({ kind: 'idle' });
  };

  const applyFaqs = (items: FaqItem[]) => {
    onApplyFaqs(items);
    toast.success(`Đã thêm ${items.length} FAQ vào tour.`);
    setPanel({ kind: 'idle' });
  };

  const applyPrice = (price: number | null | undefined) => {
    if (price == null || Number.isNaN(price)) {
      toast.error('Chưa có giá gợi ý hợp lệ.');
      return;
    }
    onApplyPrice(String(Math.round(price)));
    toast.success(`Đã áp dụng giá gợi ý ${price.toLocaleString('vi-VN')}đ.`);
    setPanel({ kind: 'idle' });
  };

  return (
    <div className="rounded-xl border border-purple-500/30 bg-linear-to-br from-purple-500/5 via-cyan-500/5 to-transparent p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-cyan-500 text-white">
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">
            AI Content Studio
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Nhập vài từ khoá → AI viết giúp bạn
          </p>
        </div>
      </div>

      <Input
        placeholder="VD: sông Hàn, hoàng hôn, gia đình, 2h, cầu Rồng phun lửa..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        className="bg-ddms-bg-main border-border text-sm h-10"
      />

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={panel.kind === 'loading'}
          onClick={() => run('name', 'Đang nghĩ tên...')}
          className="text-xs h-9 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
        >
          <Wand2 size={13} className="mr-1.5" />
          🎯 Tạo tên tour
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={panel.kind === 'loading'}
          onClick={() => run('description', 'Đang viết mô tả...')}
          className="text-xs h-9 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
        >
          <Wand2 size={13} className="mr-1.5" />
          📝 Viết mô tả
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={panel.kind === 'loading'}
          onClick={() => run('faqs', 'Đang sinh FAQ...')}
          className="text-xs h-9 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <Wand2 size={13} className="mr-1.5" />❓ Sinh FAQ
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={panel.kind === 'loading'}
          onClick={() => run('price', 'Đang phân tích giá...')}
          className="text-xs h-9 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
        >
          <Wand2 size={13} className="mr-1.5" />
          💰 Gợi ý giá
        </Button>
      </div>

      {panel.kind === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-ddms-bg-main rounded-lg p-3">
          <Loader2 size={14} className="animate-spin text-cyan-500" />
          {panel.label}
        </div>
      )}

      {panel.kind === 'names' && (
        <div className="rounded-lg border border-border bg-ddms-bg-main p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              Chọn tên bạn thích:
            </p>
            <button
              type="button"
              onClick={() => setPanel({ kind: 'idle' })}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            {panel.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyName(opt)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-purple-500 hover:bg-purple-500/5 transition-colors"
              >
                <span className="font-medium">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {panel.kind === 'description' && (
        <div className="rounded-lg border border-border bg-ddms-bg-main p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              Mô tả AI đề xuất:
            </p>
            <button
              type="button"
              onClick={() => setPanel({ kind: 'idle' })}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <Textarea
            value={panel.text}
            onChange={(e) =>
              setPanel({ kind: 'description', text: e.target.value })
            }
            className="bg-transparent border-border text-sm h-40 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => run('description', 'Đang viết lại...')}
              className="text-xs h-8"
            >
              🔄 Viết lại
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => applyDescription(panel.text)}
              className="text-xs h-8 bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              <Check size={12} className="mr-1" /> Áp dụng
            </Button>
          </div>
        </div>
      )}

      {panel.kind === 'faqs' && (
        <div className="rounded-lg border border-border bg-ddms-bg-main p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {panel.items.length} FAQ được sinh:
            </p>
            <button
              type="button"
              onClick={() => setPanel({ kind: 'idle' })}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {panel.items.map((f, i) => (
              <div
                key={i}
                className="text-xs rounded-md border border-border p-2 bg-background"
              >
                <p className="font-semibold text-foreground">Q: {f.question}</p>
                <p className="text-muted-foreground mt-1">A: {f.answer}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => applyFaqs(panel.items)}
              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Check size={12} className="mr-1" /> Thêm tất cả vào FAQ
            </Button>
          </div>
        </div>
      )}

      {panel.kind === 'price' && (
        <div className="rounded-lg border border-border bg-ddms-bg-main p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              Gợi ý giá từ AI:
            </p>
            <button
              type="button"
              onClick={() => setPanel({ kind: 'idle' })}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
          {panel.suggested != null && (
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {panel.suggested.toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
            {panel.text}
          </p>
          {panel.suggested != null && (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => applyPrice(panel.suggested!)}
                className="text-xs h-8 bg-amber-600 hover:bg-amber-500 text-white"
              >
                <Check size={12} className="mr-1" /> Áp dụng giá này
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
