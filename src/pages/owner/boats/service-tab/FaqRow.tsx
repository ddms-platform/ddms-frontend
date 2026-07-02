import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FaqForm } from '../service-tab';

interface FaqRowProps {
  faq: FaqForm;
  onChange: (field: keyof FaqForm, value: string) => void;
}

const FaqRow = ({ faq, onChange }: FaqRowProps) => (
  <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border border-border">
    <div>
      <label className="text-xs text-muted-foreground">Câu hỏi (Q)</label>
      <Input
        placeholder="VD: Tour có đón trả khách tại khách sạn không?"
        className="bg-ddms-bg-main border-border text-foreground mt-1"
        value={faq.question}
        onChange={(e) => onChange('question', e.target.value)}
      />
    </div>
    <div>
      <label className="text-xs text-muted-foreground">Trả lời (A)</label>
      <Textarea
        placeholder="VD: Có, chúng tôi đón khách tại các khách sạn trung tâm..."
        className="bg-ddms-bg-main border-border text-foreground mt-1 h-15"
        value={faq.answer}
        onChange={(e) => onChange('answer', e.target.value)}
      />
    </div>
  </div>
);

export default FaqRow;
