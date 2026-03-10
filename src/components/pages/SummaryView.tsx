'use client';

import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber } from '@/lib/formatters';
import KPICard from '@/components/ui/KPICard';
import SectionTitle from '@/components/ui/SectionTitle';
import ChartTooltip from '@/components/ui/ChartTooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function SummaryView() {
  const { yearly, monthly } = useFinancial();

  const monthlyRev = monthly[0].revenue;
  const monthlyExp = monthly[0].expenses;
  const monthlyComm = monthly[0].commissions;
  const monthlyProfit = monthly[0].profit;

  const chartData = yearly.map((y, i) => ({
    name: `Year ${i + 1}`,
    Revenue: y.revenue,
    Expenses: y.expenses + y.commissions,
    Profit: y.profit,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionTitle title="P&L Overview" />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Monthly Revenue"
          value={formatMAD(monthlyRev)}
          subtitle="Year 1 monthly avg"
          color="#d4a853"
          icon={<TrendUpSm />}
          bars={monthly.map((m) => m.revenue)}
        />
        <KPICard
          title="Monthly Expenses"
          value={formatMAD(monthlyExp)}
          subtitle="Year 1 monthly avg"
          color="#f43f5e"
          icon={<TrendDownSm />}
          bars={monthly.map((m) => m.expenses)}
        />
        <KPICard
          title="Agent Commissions"
          value={formatMAD(monthlyComm)}
          subtitle="25% of revenue"
          color="#f97316"
          icon={<PercentSm />}
          bars={monthly.map((m) => m.commissions)}
        />
        <KPICard
          title="Net Profit"
          value={formatMAD(monthlyProfit)}
          subtitle={monthlyProfit >= 0 ? 'Positive' : 'Negative'}
          color="#2dd4bf"
          icon={<DollarSm />}
          bars={monthly.map((m) => m.profit)}
        />
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-white/50 mb-4">Revenue vs Expenses vs Profit — Annual</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#ffffff60' }}
              />
              <Bar dataKey="Revenue" fill="#d4a853" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Annual P&L Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Metric</th>
              {['Year 1', 'Year 2', 'Year 3'].map((y) => (
                <th key={y} className="text-right px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Revenue', key: 'revenue', color: '#d4a853' },
              { label: 'Commissions (25%)', key: 'commissions', color: '#f97316' },
              { label: 'Operating Expenses', key: 'expenses', color: '#f43f5e' },
              { label: 'Profit Before Tax', key: 'profit', color: '#2dd4bf' },
            ].map((row) => (
              <tr key={row.key} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3 text-white/70">{row.label}</td>
                {yearly.map((y, i) => {
                  const val = y[row.key as keyof typeof y];
                  return (
                    <td key={i} className="px-6 py-3 text-right font-mono" style={{ color: row.color }}>
                      {formatNumber(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Big Profit Display */}
      <div className="card p-8 text-center">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Year 3 Net Profit</p>
        <p className="font-mono text-4xl font-bold" style={{ color: yearly[2].profit >= 0 ? '#2dd4bf' : '#f43f5e' }}>
          {formatMAD(yearly[2].profit)}
        </p>
        <p className="text-sm text-white/30 mt-2">
          {formatMAD(yearly[2].profit / 12)} / month
        </p>
      </div>
    </div>
  );
}

function TrendUpSm() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
    </svg>
  );
}

function TrendDownSm() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898" />
    </svg>
  );
}

function PercentSm() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15M8.25 8.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7.5 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  );
}

function DollarSm() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
    </svg>
  );
}
