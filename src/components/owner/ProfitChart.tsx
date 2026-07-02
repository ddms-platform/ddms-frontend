import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import type { ProfitChartProps } from '@/interfaces/owner';
import SimpleBarChart from '@/components/common/SimpleBarChart';
import { CsvExporter } from '@/lib/csvExporter';

export default function ProfitChart({ data = [] }: ProfitChartProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'month' | 'quarter' | 'year'>('month');

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
    const headers = [t('profitChart.csvTime'), t('profitChart.csvRevenue')];
    const rows = chartData.map((d) => [
      t(`profitChart.months.${d.name}`, d.name),
      d.profit,
    ]);
    CsvExporter.export(
      headers,
      rows,
      `${t('profitChart.csvFileName')}_${filter}_${new Date().getTime()}.csv`,
    );
  };

  return (
    <div className="bg-ddms-bg-card rounded-2xl border border-border shadow-lg p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {t('profitChart.title')}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t('profitChart.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setFilter('month')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'month'
                  ? 'bg-ddms-secondary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('profitChart.month')}
            </button>
            <button
              onClick={() => setFilter('quarter')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'quarter'
                  ? 'bg-ddms-secondary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('profitChart.quarter')}
            </button>
            <button
              onClick={() => setFilter('year')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'year'
                  ? 'bg-ddms-secondary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('profitChart.year')}
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-ddms-bg-main text-foreground border border-border hover:bg-foreground/5 transition-colors"
            title={t('profitChart.export')}
          >
            <Download className="w-3.5 h-3.5" />
            {t('profitChart.export')}
          </button>
        </div>
      </div>

      <SimpleBarChart
        data={chartData.map((d) => ({
          name: t(`profitChart.months.${d.name}`, d.name),
          value: d.profit,
        }))}
        highlightName={
          filter === 'month'
            ? t(`profitChart.months.${currentMonthName}`, currentMonthName)
            : undefined
        }
        valueFormatter={formatCurrency}
      />
    </div>
  );
}
