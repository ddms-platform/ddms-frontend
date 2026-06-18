import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface PremiumBarChartProps {
  data: any[];
  dataKey: string;
  color: string;
  yAxisFormatter?: (val: number) => string;
  valueFormatter?: (val: number) => string;
  tooltipLabel?: string;
}

export default function PremiumBarChart({
  data,
  dataKey,
  color,
  yAxisFormatter,
  valueFormatter,
  tooltipLabel,
}: PremiumBarChartProps) {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        {t('ownerTours.stats.noData', 'Chưa có dữ liệu')}
      </div>
    );
  }

  const values = data.map((d) => d[dataKey] || 0);
  const maxVal = Math.max(...values, 1);
  const ticks = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  return (
    <div className="relative w-full max-w-112.5 h-70 flex flex-col font-sans select-none custom-chart-container">
      <div className="flex flex-1 relative">
        {/* Y Axis */}
        <div className="w-12.5 flex flex-col justify-between text-[10px] text-slate-400 pr-2 select-none h-50 mt-2.5 text-right">
          {ticks.map((tick, i) => (
            <div key={i} className="h-0 flex items-center justify-end">
              {yAxisFormatter ? yAxisFormatter(tick) : Math.round(tick)}
            </div>
          ))}
        </div>

        {/* Chart Bars Container */}
        <div className="flex-1 border-l border-b border-slate-700/80 flex items-end justify-around px-2 pb-1 relative h-50 mt-2.5">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1">
            <div className="border-t border-slate-800/40 w-full h-0"></div>
            <div className="border-t border-slate-800/40 w-full h-0"></div>
            <div className="border-t border-slate-800/40 w-full h-0"></div>
            <div className="h-0 w-full"></div>
          </div>

          {/* Bars */}
          {data.map((item, index) => {
            const val = item[dataKey] || 0;
            const pct = (val / maxVal) * 100;
            return (
              <div
                key={index}
                className="group relative flex flex-col items-center flex-1 mx-2 max-w-10 h-full justify-end cursor-pointer z-10"
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const container = e.currentTarget.closest(
                    '.custom-chart-container',
                  );
                  const containerRect = container?.getBoundingClientRect();
                  if (containerRect) {
                    setTooltipPos({
                      x: rect.left - containerRect.left + rect.width / 2,
                      y: rect.top - containerRect.top - 10,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  style={{ height: `${pct}%`, backgroundImage: color }}
                  className="w-full rounded-t transition-all duration-300 group-hover:brightness-125 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X Axis labels */}
      <div className="flex pl-12.5 justify-around text-[10px] text-slate-400 pt-2 select-none px-2 min-h-12 items-start">
        {data.map((item, index) => {
          const name = item.tourName || '';
          return (
            <div
              key={index}
              className="text-center flex-1 mx-1 text-[10px] leading-tight break-all line-clamp-3"
              title={name}
            >
              {name}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded py-1.5 px-3 z-50 shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="font-semibold text-slate-300 text-[10px] mb-0.5">
            {data[hoveredIndex].tourName}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundImage: color }}
            ></span>
            <span className="text-slate-400">
              {tooltipLabel ||
                (dataKey === 'bookingsCount'
                  ? t('ownerTours.stats.bookingsCountLabel', 'Lượt đặt: ')
                  : t('ownerTours.stats.totalRevenueLabel', 'Doanh thu: '))}
            </span>
            <span className="font-bold">
              {valueFormatter
                ? valueFormatter(data[hoveredIndex][dataKey])
                : data[hoveredIndex][dataKey]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
