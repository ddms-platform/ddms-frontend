import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartPoint {
  name: string;
  revenue: number;
  owed: number;
}

interface RevenueChartProps {
  data: ChartPoint[];
  formatVND: (value: number) => string;
}

const RevenueChart = ({ data, formatVND }: RevenueChartProps) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-[#111C3A] rounded-2xl border border-slate-800/60 p-6 mb-8 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
        Xu hướng Tài chính
      </h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOwed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickFormatter={(v) => `${v / 1000000}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111C3A',
                borderColor: '#374151',
                borderRadius: '12px',
              }}
              formatter={(value: any) => [formatVND(value as number), '']}
            />
            <Legend />
            <Area
              name="Doanh thu Tour"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              name="Chi phí hệ thống"
              type="monotone"
              dataKey="owed"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorOwed)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
