'use client';

import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber } from '@/lib/formatters';

export default function SummaryView() {
  const { yearly } = useFinancial();

  const profitGrowth = yearly[1].profit !== 0
    ? ((yearly[2].profit - yearly[1].profit) / Math.abs(yearly[1].profit) * 100).toFixed(0)
    : '—';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Annual P&L Table */}
      <div className="card overflow-hidden">
        <div className="px-7 py-4 border-b border-white/[0.04]">
          <h3 className="text-[13px] font-semibold text-white/70">Profit & Loss Statement</h3>
          <p className="text-[11px] text-white/25 mt-0.5">Annualized figures (monthly x 12)</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left px-7 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">Metric</th>
              {['Year 1', 'Year 2', 'Year 3'].map((y) => (
                <th key={y} className="text-right px-7 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Gross Revenue', key: 'revenue', color: '#d4a853', bold: false },
              { label: 'Agent Commissions (25%)', key: 'commissions', color: '#f97316', bold: false },
              { label: 'Operating Expenses', key: 'expenses', color: '#f43f5e', bold: false },
              { label: 'Net Profit Before Tax', key: 'profit', color: '#2dd4bf', bold: true },
            ].map((row) => (
              <tr
                key={row.key}
                className={`transition-colors hover:bg-white/[0.015] ${
                  row.bold ? 'border-t border-white/[0.06]' : 'border-b border-white/[0.02]'
                }`}
              >
                <td className={`px-7 py-3.5 ${row.bold ? 'font-semibold text-white/90' : 'text-white/50'}`}>
                  {row.label}
                </td>
                {yearly.map((y, i) => {
                  const val = y[row.key as keyof typeof y];
                  return (
                    <td
                      key={i}
                      className={`px-7 py-3.5 text-right font-mono text-[13px] ${row.bold ? 'font-bold' : 'font-medium'}`}
                      style={{ color: row.bold ? row.color : `${row.color}99` }}
                    >
                      {row.key === 'commissions' || row.key === 'expenses' ? '(' : ''}
                      {formatNumber(Math.abs(val))}
                      {row.key === 'commissions' || row.key === 'expenses' ? ')' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Big Profit Display */}
      <div className="card p-10 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(ellipse at center, ${yearly[2].profit >= 0 ? '#2dd4bf' : '#f43f5e'} 0%, transparent 70%)`,
          }}
        />
        <div className="relative">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.25em] mb-4">Year 3 Projected Net Profit</p>
          <p
            className="font-mono text-5xl font-bold tracking-tight"
            style={{
              color: yearly[2].profit >= 0 ? '#2dd4bf' : '#f43f5e',
              textShadow: `0 0 40px ${yearly[2].profit >= 0 ? '#2dd4bf' : '#f43f5e'}15`,
            }}
          >
            {formatMAD(yearly[2].profit)}
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <span className="text-[12px] text-white/25 font-mono">
              {formatMAD(yearly[2].profit / 12)} /mo
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-[12px] font-mono" style={{ color: Number(profitGrowth) >= 0 ? '#2dd4bf80' : '#f43f5e80' }}>
              {profitGrowth}% YoY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
