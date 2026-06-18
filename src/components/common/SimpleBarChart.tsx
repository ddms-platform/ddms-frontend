import { useState } from 'react';

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface SimpleBarChartProps {
  data: ChartDataItem[];
  highlightName?: string;
  valueFormatter?: (value: number) => string;
}

export default function SimpleBarChart({
  data,
  highlightName,
  valueFormatter = (val) => String(val),
}: SimpleBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.value), 1); // Ensure non-zero divisor

  return (
    <div className="relative h-62.5 w-full flex items-end justify-between px-2 pb-6 mt-10 border-b border-slate-800">
      {data.map((entry, index) => {
        const heightPercentage = (entry.value / maxVal) * 100;
        const isHighlight = highlightName && entry.name === highlightName;
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            className="relative flex flex-col items-center flex-1 h-full justify-end group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            <div
              className={`absolute -top-14 z-10 bg-slate-800 border border-slate-700 p-2 rounded shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200 ${
                isHovered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              <p className="text-white font-medium text-xs mb-0.5">
                {entry.name}
              </p>
              <p className="text-cyan-400 font-bold text-sm">
                {valueFormatter(entry.value)}
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
            </div>

            {/* Bar */}
            <div
              className={`w-4/5 max-w-[40px] rounded-t-sm transition-all duration-500 ease-out ${
                isHighlight || isHovered
                  ? 'bg-cyan-400'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              style={{ height: `${Math.max(heightPercentage, 2)}%` }}
            ></div>

            {/* Label below bar */}
            <span
              className={`absolute -bottom-7 text-[10px] font-medium transition-colors ${
                isHighlight || isHovered ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {entry.name}
            </span>

            {/* Active Underline for Highlight */}
            {isHighlight && (
              <div className="absolute -bottom-9 w-12 h-0.5 bg-cyan-400"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
