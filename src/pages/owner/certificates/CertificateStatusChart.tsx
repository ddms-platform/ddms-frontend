import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { OwnerCertificateListItem } from '@/services/certificateService';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'expired';

const COLORS = {
  approved: '#10B981',
  pending: '#F59E0B',
  rejected: '#A855F7',
  expired: '#EF4444',
} as const;

interface CertificateStatusChartProps {
  certificates: OwnerCertificateListItem[];
  statusFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  isExpiringSoon: (cert: OwnerCertificateListItem) => boolean;
}

export default function CertificateStatusChart({
  certificates,
  statusFilter,
  onFilterChange,
  isExpiringSoon,
}: CertificateStatusChartProps) {
  const { t } = useTranslation();

  const { rows, slices, total, attention } = useMemo(() => {
    const counts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      expired: 0,
    };

    for (const c of certificates) {
      if (c.status === 'pending') counts.pending += 1;
      else if (c.status === 'rejected') counts.rejected += 1;
      else if (c.status === 'expired' || isExpiringSoon(c)) counts.expired += 1;
      else if (c.status === 'approved') counts.approved += 1;
    }

    const rows = [
      {
        key: 'approved' as const,
        label: t('ownerCertificates.filter.approved'),
        value: counts.approved,
        color: COLORS.approved,
      },
      {
        key: 'pending' as const,
        label: t('ownerCertificates.filter.pending'),
        value: counts.pending,
        color: COLORS.pending,
      },
      {
        key: 'expired' as const,
        label: t('ownerCertificates.filter.expired'),
        value: counts.expired,
        color: COLORS.expired,
      },
      {
        key: 'rejected' as const,
        label: t('ownerCertificates.filter.rejected'),
        value: counts.rejected,
        color: COLORS.rejected,
      },
    ] as const;

    return {
      rows,
      slices: rows.filter((s) => s.value > 0),
      total: certificates.length,
      attention: counts.pending + counts.rejected + counts.expired,
    };
  }, [certificates, isExpiringSoon, t]);

  const chartData =
    slices.length > 0
      ? slices.map((s) => ({
          key: s.key,
          name: s.label,
          value: s.value,
          color: s.color,
        }))
      : [
          {
            key: 'all' as const,
            name: t('ownerCertificates.chart.empty'),
            value: 1,
            color: 'rgba(136,146,160,0.35)',
          },
        ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="bg-ddms-bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('ownerCertificates.chart.title')}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('ownerCertificates.chart.subtitle')}
            </p>
          </div>
          {attention > 0 && (
            <span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-500">
              {t('ownerCertificates.attentionCount', { count: attention })}
            </span>
          )}
        </div>

        <div className="relative mx-auto h-56 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={slices.length > 1 ? 3 : 0}
                stroke="transparent"
                onClick={(entry) => {
                  const key = (entry as { key?: StatusFilter })?.key;
                  if (key && key !== 'all') {
                    onFilterChange(statusFilter === key ? 'all' : key);
                  }
                }}
                style={{ cursor: slices.length ? 'pointer' : 'default' }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.color}
                    opacity={
                      statusFilter === 'all' ||
                      statusFilter === entry.key ||
                      entry.key === 'all'
                        ? 1
                        : 0.35
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [value ?? 0, '']}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {total}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t('ownerCertificates.stats.total')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-ddms-bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('ownerCertificates.chart.legend')}
        </p>
        {rows.map((row) => {
          const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
          const active = statusFilter === row.key;
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onFilterChange(active ? 'all' : row.key)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                active
                  ? 'border-ddms-secondary/40 bg-ddms-secondary/10'
                  : 'border-border bg-ddms-bg-main/60 hover:bg-foreground/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-xs font-medium text-foreground truncate">
                    {row.label}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {row.value}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
