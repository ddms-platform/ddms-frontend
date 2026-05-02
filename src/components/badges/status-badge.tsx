import { Check, X, type LucideIcon } from 'lucide-react';

type BadgeVariant = 'available' | 'unavailable' | 'success' | 'error' | 'warning' | 'info';

const VARIANT_CONFIG: Record<BadgeVariant, { bg: string; color: string; icon: LucideIcon }> = {
  available: {
    bg: 'rgba(16, 185, 129, 0.9)',
    color: '#ffffff',
    icon: Check,
  },
  unavailable: {
    bg: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    icon: X,
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.9)',
    color: '#ffffff',
    icon: Check,
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    icon: X,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.9)',
    color: '#ffffff',
    icon: X,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.9)',
    color: '#ffffff',
    icon: Check,
  },
};

export interface StatusBadgeProps {
  /** Display label */
  label: string;
  /** Visual variant controlling color & icon */
  variant?: BadgeVariant;
  /** Override the default icon */
  icon?: LucideIcon;
  /** Icon size in px (default: 12) */
  iconSize?: number;
  /** Show icon (default: true) */
  showIcon?: boolean;
  /** Enable backdrop blur (default: true) */
  blur?: boolean;
  /** Extra CSS classes */
  className?: string;
}

export default function StatusBadge({
  label,
  variant = 'available',
  icon,
  iconSize = 12,
  showIcon = true,
  blur = true,
  className = '',
}: StatusBadgeProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = icon || config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        backdropFilter: blur ? 'blur(8px)' : undefined,
      }}
    >
      {showIcon && <Icon size={iconSize} />}
      {label}
    </div>
  );
}
