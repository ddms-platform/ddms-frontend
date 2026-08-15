import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cardClass, cardStyle } from './form-styles';

interface SectionCardProps {
  icon: LucideIcon;
  /** Nhan buoc, vi du "01". */
  step?: string;
  title: string;
  description?: string;
  /** Nut phu hien o goc phai tieu de. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * The mot muc cua form dang ky: icon + so thu tu + tieu de + mo ta.
 * Dung chung cho phan chu so huu va tung du thuyen de cac muc nhin nhat quan.
 */
export default function SectionCard({
  icon: Icon,
  step,
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className={cardClass} style={cardStyle}>
      <div className="mb-6 flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ddms-secondary/12 text-ddms-secondary">
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          {step && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ddms-secondary">
              {step}
            </p>
          )}
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children}
    </section>
  );
}
