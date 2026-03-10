'use client';

import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber, formatPercent } from '@/lib/formatters';
import KPICard from '@/components/ui/KPICard';
import SectionTitle from '@/components/ui/SectionTitle';
import ChartTooltip from '@/components/ui/ChartTooltip';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function InvestmentView() {
  const {
    investment,
    setInvestment,
    founderSalary,
    setFounderSalary,
    growthBoost,
    setGrowthBoost,
    simulation,
  } = useFinancial();

  const { snapshots, breakEvenMonth, roi, finalCash } = simulation;

  const chartData = snapshots.map((s) => ({
    name: `M${s.month}`,
    Balance: s.balance,
    Profit: s.profit,
  }));

  // Table: every 6 months + break-even
  const tableMonths = [1, 6, 12, 18, 24, 30, 36];
  if (breakEvenMonth > 0 && !tableMonths.includes(breakEvenMonth)) {
    tableMonths.push(breakEvenMonth);
    tableMonths.sort((a, b) => a - b);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionTitle title="Investment Simulation" color="#2dd4bf" />

      {/* Sliders */}
      <div className="grid grid-cols-3 gap-4">
        <SliderCard
          label="Initial Investment"
          value={investment}
          onChange={setInvestment}
          min={100000}
          max={2000000}
          step={50000}
          format={formatMAD}
          color="#d4a853"
        />
        <SliderCard
          label="Founder Monthly Salary"
          value={founderSalary}
          onChange={setFounderSalary}
          min={0}
          max={40000}
          step={2000}
          format={formatMAD}
          color="#f97316"
        />
        <SliderCard
          label="Growth Boost vs Base"
          value={growthBoost}
          onChange={setGrowthBoost}
          min={-0.3}
          max={0.5}
          step={0.05}
          format={(v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
          color="#7c6bf4"
        />
      </div>

      {/* Result KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Investment"
          value={formatMAD(investment)}
          color="#d4a853"
          icon={<DollarIcon />}
        />
        <KPICard
          title="Break-even"
          value={breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : 'N/A'}
          subtitle={breakEvenMonth > 0 ? `Year ${Math.ceil(breakEvenMonth / 12)}` : 'Not reached'}
          color="#2dd4bf"
          icon={<TargetIcon />}
        />
        <KPICard
          title="3-Year ROI"
          value={formatPercent(roi)}
          color={roi >= 0 ? '#2dd4bf' : '#f43f5e'}
          icon={<ChartIcon />}
        />
        <KPICard
          title="Final Cash"
          value={formatMAD(finalCash)}
          color={finalCash >= 0 ? '#2dd4bf' : '#f43f5e'}
          icon={<WalletIcon />}
        />
      </div>

      {/* Cash Balance Chart */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-white/50 mb-4">Cash Balance — 36 Months</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#ffffff50', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={5}
              />
              <YAxis
                tick={{ fill: '#ffffff50', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#ffffff20" strokeDasharray="3 3" />
              {breakEvenMonth > 0 && (
                <ReferenceLine
                  x={`M${breakEvenMonth}`}
                  stroke="#2dd4bf"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Break-even',
                    fill: '#2dd4bf',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="Balance"
                stroke="#2dd4bf"
                fill="url(#balanceGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Month', 'Monthly Profit', 'Cumulative P&L', 'Cash Balance'].map((h) => (
                <th key={h} className="px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider text-right first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableMonths.map((m) => {
              const snap = snapshots[m - 1];
              if (!snap) return null;
              const isBreakEven = m === breakEvenMonth;
              return (
                <tr
                  key={m}
                  className={`border-b border-white/[0.03] transition-colors ${
                    isBreakEven ? 'bg-[#2dd4bf]/5 border-[#2dd4bf]/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="px-6 py-2.5 text-white/70">
                    {isBreakEven ? (
                      <span className="text-[#2dd4bf] font-semibold">Month {m} (Break-even)</span>
                    ) : (
                      `Month ${m}`
                    )}
                  </td>
                  <td className="px-6 py-2.5 text-right font-mono" style={{ color: snap.profit >= 0 ? '#2dd4bf' : '#f43f5e' }}>
                    {formatNumber(Math.round(snap.profit))}
                  </td>
                  <td className="px-6 py-2.5 text-right font-mono" style={{ color: snap.cumulative >= 0 ? '#2dd4bf' : '#f43f5e' }}>
                    {formatNumber(Math.round(snap.cumulative))}
                  </td>
                  <td className="px-6 py-2.5 text-right font-mono" style={{ color: snap.balance >= 0 ? '#2dd4bf' : '#f43f5e' }}>
                    {formatNumber(Math.round(snap.balance))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SliderCard({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  color: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between mt-1 text-[10px] text-white/30 font-mono">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function DollarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-4a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}
