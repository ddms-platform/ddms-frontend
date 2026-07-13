import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FaqForm } from '../service-tab';

interface FaqRowProps {
  faq: FaqForm;
  onChange: (field: keyof FaqForm, value: string) => void;
}

const fieldLabelClass = 'text-sm font-medium text-muted-foreground';
const inputClass =
  'h-11 bg-ddms-bg-main border-border text-sm text-foreground mt-1.5';

const FaqRow = ({ faq, onChange }: FaqRowProps) => (
  <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-5">
    <div>
      <label className={fieldLabelClass}>Câu hỏi (Q)</label>
      <Input
        placeholder="VD: Tour có đón trả khách tại khách sạn không?"
        className={inputClass}
        value={faq.question}
        onChange={(e) => onChange('question', e.target.value)}
      />
    </div>
    <div>
      <label className={fieldLabelClass}>Trả lời (A)</label>
      <Textarea
        placeholder="VD: Có, chúng tôi đón khách tại các khách sạn trung tâm..."
        className="bg-ddms-bg-main border-border text-sm text-foreground mt-1.5 h-24 resize-none"
        value={faq.answer}
        onChange={(e) => onChange('answer', e.target.value)}
      />
    </div>
  </div>
);

export default FaqRow;
