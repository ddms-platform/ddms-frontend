import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  topIcon: LucideIcon;
  topIconColor: string;
  topIconBg: string;
  valueColor: string;
  bgIcon?: LucideIcon;
  bgIconColor?: string;
  variant?: 'default' | 'highlight';
  labelColor?: string;
  footer?: ReactNode;
}

const MetricCard = ({
  label,
  value,
  topIcon: TopIcon,
  topIconColor,
  topIconBg,
  valueColor,
  bgIcon: BgIcon,
  bgIconColor,
  variant = 'default',
  labelColor = 'text-slate-400',
  footer,
}: MetricCardProps) => {
  const outerClass =
    variant === 'highlight'
      ? 'p-5 rounded-2xl bg-linear-to-br from-[#1b1e35] to-[#122340] border border-cyan-500/30 shadow-lg relative overflow-hidden'
      : 'p-5 rounded-2xl bg-[#111C3A] border border-slate-800/60 shadow-lg relative overflow-hidden group';

  return (
    <div className={outerClass}>
      {BgIcon && (
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <BgIcon className={`w-24 h-24 ${bgIconColor ?? ''}`} />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <p
          className={`text-xs font-semibold ${labelColor} uppercase tracking-wider`}
        >
          {label}
        </p>
        <div className={`p-2 ${topIconBg} rounded-xl`}>
          <TopIcon className={`w-5 h-5 ${topIconColor}`} />
        </div>
      </div>
      <h2
        className={`text-2xl font-black ${valueColor} tracking-tight ${footer ? 'mb-2' : ''}`}
      >
        {value}
      </h2>
      {footer}
    </div>
  );
};

export default MetricCard;
