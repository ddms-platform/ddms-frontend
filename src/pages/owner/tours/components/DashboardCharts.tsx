import { PieChart as PieChartIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PremiumBarChart from '@/components/common/PremiumBarChart';

interface DashboardChartsProps {
  stats: any[];
}

const DashboardCharts = ({ stats }: DashboardChartsProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-ddms-bg-card rounded-xl border border-border p-6 shadow-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-ddms-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <PieChartIcon className="w-5 h-5 text-ddms-secondary" />
        <h2 className="text-xl font-bold text-foreground">
          {t('ownerTours.stats.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 overflow-x-auto">
        <div className="flex h-75 flex-col items-center min-w-100">
          <h3 className="text-center text-sm text-muted-foreground mb-2">
            {t('ownerTours.stats.bookingsCount')}
          </h3>
          <div className="pt-4 flex justify-center w-full">
            <PremiumBarChart
              data={stats}
              dataKey="bookingsCount"
              color="linear-gradient(180deg, #34d399 0%, #059669 100%)"
              yAxisFormatter={(val) => String(Math.round(val))}
              valueFormatter={(val) =>
                t('ownerTours.stats.bookingsCountUnit', { count: val })
              }
              tooltipLabel={t('ownerTours.stats.bookingsCountLabel')}
            />
          </div>
        </div>
        <div className="flex h-75 flex-col items-center min-w-100">
          <h3 className="text-center text-sm text-muted-foreground mb-2">
            {t('ownerTours.stats.totalRevenue')}
          </h3>
          <div className="pt-4 flex justify-center w-full">
            <PremiumBarChart
              data={stats}
              dataKey="totalRevenue"
              color="linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)"
              yAxisFormatter={(val) =>
                val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : String(val)
              }
              valueFormatter={(val) =>
                val.toLocaleString(i18n.language) + ' VNĐ'
              }
              tooltipLabel={t('ownerTours.stats.totalRevenueLabel')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
