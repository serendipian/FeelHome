'use client';

import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber, formatPercent } from '@/lib/formatters';
import KPICard from '@/components/ui/KPICard';

export default function InvestmentView() {
  const {
    investment, setInvestment,
    founderSalary, setFounderSalary,
    growthBoost, setGrowthBoost,
    simulation,
  } = useFinancial();

  const { snapshots, breakEvenMonth, roi, finalCash } = simulation;

  const tableMonths = [1, 6, 12, 18, 24, 30, 36];
  if (breakEvenMonth > 0 && !tableMonths.includes(breakEvenMonth)) {
    tableMonths.push(breakEvenMonth);
    tableMonths.sort((a, b) => a - b);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sliders */}
      <div className="grid grid-cols-3 gap-5">
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
          label="Founder Salary"
          value={founderSalary}
          onChange={setFounderSalary}
          min={0}
          max={40000}
          step={2000}
          format={formatMAD}
          color="#f97316"
        />
        <SliderCard
          label="Growth Adjustment"
          value={growthBoost}
          onChange={setGrowthBoost}
          min={-0.3}
          max={0.5}
          step={0.05}
          format={(v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
          color="#1d7ff3"
        />
      </div>

      {/* Result KPIs */}
      <div className="grid grid-cols-4 gap-5">
        <KPICard
          title="Total Investment"
          value={formatMAD(investment)}
          color="#d4a853"
          icon={<DollarIcon />}
        />
        <KPICard
          title="Break-even Point"
          value={breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : 'N/A'}
          subtitle={breakEvenMonth > 0 ? `Year ${Math.ceil(breakEvenMonth / 12)}` : 'Not reached in 36mo'}
          color="#2dd4bf"
          icon={<TargetIcon />}
        />
        <KPICard
          title="3-Year ROI"
          value={formatPercent(roi)}
          subtitle={roi >= 0 ? 'Return on investment' : 'Capital loss'}
          color={roi >= 0 ? '#2dd4bf' : '#f43f5e'}
          trend={roi >= 0 ? 'up' : 'down'}
          icon={<ChartIcon />}
        />
        <KPICard
          title="Final Cash Position"
          value={formatMAD(finalCash)}
          subtitle="After 36 months"
          color={finalCash >= 0 ? '#2dd4bf' : '#f43f5e'}
          icon={<WalletIcon />}
        />
      </div>

      {/* Snapshots Table */}
      <div className="card overflow-hidden">
        <div className="px-7 py-4 border-b border-white/[0.04]">
          <h3 className="text-[13px] font-semibold text-white/70">Cash Flow Snapshots</h3>
          <p className="text-[11px] text-white/25 mt-0.5">Key milestones over 36 months</p>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Month', 'Monthly P&L', 'Cumulative', 'Cash Balance'].map((h) => (
                <th key={h} className="px-7 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider text-right first:text-left">
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
                  className={`transition-colors ${
                    isBreakEven
                      ? 'bg-[#2dd4bf]/[0.04]'
                      : 'border-b border-white/[0.02] hover:bg-white/[0.015]'
                  }`}
                  style={isBreakEven ? { borderTop: '1px solid rgba(45,212,191,0.15)', borderBottom: '1px solid rgba(45,212,191,0.15)' } : {}}
                >
                  <td className="px-7 py-3 text-white/50 font-medium">
                    {isBreakEven ? (
                      <span className="text-[#2dd4bf] font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
                        Month {m}
                      </span>
                    ) : (
                      `Month ${m}`
                    )}
                  </td>
                  <td className="px-7 py-3 text-right font-mono font-medium" style={{ color: snap.profit >= 0 ? '#2dd4bf' : '#f43f5e' }}>
                    {formatNumber(Math.round(snap.profit))}
                  </td>
                  <td className="px-7 py-3 text-right font-mono font-medium" style={{ color: snap.cumulative >= 0 ? '#2dd4bf' : '#f43f5e' }}>
                    {formatNumber(Math.round(snap.cumulative))}
                  </td>
                  <td className="px-7 py-3 text-right font-mono font-bold" style={{ color: snap.balance >= 0 ? '#2dd4bf' : '#f43f5e' }}>
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
  label, value, onChange, min, max, step, format, color,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; format: (v: number) => string; color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="card p-6 relative overflow-hidden">
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-[0.07]"
        style={{ background: color }}
      />
      <div className="flex items-center justify-between mb-4 relative">
        <span className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.15em]">{label}</span>
        <span className="font-mono text-[15px] font-bold" style={{ color }}>
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer relative z-10"
          style={{ accentColor: color }}
        />
        <div className="absolute top-[9px] left-0 right-0 h-[3px] rounded-full bg-white/[0.04] pointer-events-none">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }}
          />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-white/20 font-mono tracking-wide">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function DollarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-4a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}
