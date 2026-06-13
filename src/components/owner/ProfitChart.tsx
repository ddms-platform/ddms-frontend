import { useState, useMemo } from 'react';
import type { MonthlyProfit } from '@/services/boatService';

interface ProfitChartProps {
  data: MonthlyProfit[];
}

export default function ProfitChart({ data = [] }: ProfitChartProps) {
  const [filter, setFilter] = useState<'month' | 'quarter' | 'year'>('month');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default fallback if no data provided
  const baseData =
    data.length > 0
      ? data
      : Array.from({ length: 12 }).map((_, i) => ({
          month: new Date(0, i)
            .toLocaleString('en', { month: 'short' })
            .toUpperCase(),
          profit: 0,
          year: new Date().getFullYear(),
        }));

  const chartData = useMemo(() => {
    if (filter === 'month') {
      return baseData.map((d) => ({ name: d.month, profit: d.profit }));
    }

    if (filter === 'quarter') {
      const quarters = [
        { name: 'Q1', profit: 0 },
        { name: 'Q2', profit: 0 },
        { name: 'Q3', profit: 0 },
        { name: 'Q4', profit: 0 },
      ];

      baseData.forEach((d, i) => {
        // Simple quarter mapping assuming data is ordered chronologically by month
        // or just group by quarter index (0-2: Q1, 3-5: Q2, etc)
        const qIndex = Math.floor(i / 3);
        if (qIndex < 4) {
          quarters[qIndex].profit += d.profit;
        }
      });
      return quarters;
    }

    if (filter === 'year') {
      const yearsMap: Record<number, number> = {};
      baseData.forEach((d) => {
        if (!yearsMap[d.year]) yearsMap[d.year] = 0;
        yearsMap[d.year] += d.profit;
      });
      return Object.keys(yearsMap).map((y) => ({
        name: y,
        profit: yearsMap[parseInt(y)],
      }));
    }

    return [];
  }, [baseData, filter]);

  const maxProfit = Math.max(...chartData.map((d) => d.profit), 1000000); // Ensure non-zero divisor

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const currentMonthName = new Date()
    .toLocaleString('en', { month: 'short' })
    .toUpperCase();

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Thời gian', 'Doanh thu (VNĐ)'];
    const csvContent = [
      headers.join(','),
      ...chartData.map((d) => `${d.name},${d.profit}`),
    ].join('\n');

    // Create Blob and trigger download
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `doanh_thu_${filter}_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#111C3A] rounded-2xl border border-slate-800/60 shadow-lg p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Xu hướng lợi nhuận
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Dữ liệu tổng hợp từ hệ thống theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setFilter('month')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'month'
                  ? 'bg-cyan-400 text-[#0B132B]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              THÁNG
            </button>
            <button
              onClick={() => setFilter('quarter')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'quarter'
                  ? 'bg-cyan-400 text-[#0B132B]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              QUÝ
            </button>
            <button
              onClick={() => setFilter('year')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'year'
                  ? 'bg-cyan-400 text-[#0B132B]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NĂM
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
            title="Xuất file CSV"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="relative h-62.5 w-full flex items-end justify-between px-2 pb-6 mt-10 border-b border-slate-800">
        {chartData.map((entry, index) => {
          const heightPercentage = (entry.profit / maxProfit) * 100;
          const isHighlight =
            filter === 'month' && entry.name === currentMonthName;
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
                  {formatCurrency(entry.profit)}
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

              {/* Active Underline for Current Month */}
              {isHighlight && (
                <div className="absolute -bottom-9 w-12 h-0.5 bg-cyan-400"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
