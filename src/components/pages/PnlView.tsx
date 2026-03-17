'use client';

import { useMemo } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { useCurrencyFormatters } from '@/context/CurrencyContext';
import { useViewMode } from '@/context/ViewModeContext';
import { isExpenseActive } from '@/lib/calculations';
import { ExpenseItem } from '@/types';
import { useTeam } from '@/context/TeamContext';
import type { CommissionType } from '@/types/team';
import { brands } from '@/data/brands';
import BrandAvatar from '@/components/ui/BrandAvatar';
import BrandPill from '@/components/ui/BrandPill';

function YearTag({ year, color }: { year: number; color: string }) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ color, background: `rgba(${r},${g},${b},0.1)`, border: `1px solid rgba(${r},${g},${b},0.2)` }}
    >
      Year {year}
    </span>
  );
}

function SectionBar({
  label,
  values,
  color,
}: {
  label: string;
  values: [number, number, number];
  color: string;
}) {
  const { fNum } = useCurrencyFormatters();
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div
        className="w-full md:w-1/2 flex items-center px-4 py-3 rounded-2xl backdrop-blur-2xl"
        style={{
          background: `rgba(${r},${g},${b},0.04)`,
          border: `1px solid rgba(${r},${g},${b},0.12)`,
        }}
      >
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="w-full md:w-1/2 flex gap-3">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center py-3 rounded-2xl backdrop-blur-2xl"
            style={{
              background: `rgba(${r},${g},${b},0.04)`,
              border: `1px solid rgba(${r},${g},${b},0.12)`,
            }}
          >
            <div className="font-mono text-[13px] font-bold" style={{ color }}>{fNum(Math.round(v))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  salaries: { label: 'Salaries', color: '#f43f5e' },
  fixed: { label: 'Fixed Costs', color: '#f43f5e' },
  marketing: { label: 'Marketing', color: '#f43f5e' },
};

export default function PnlView() {
  const {
    activeBrands,
    activeMarkets,
    yearly,
    saleRevenues,
    rentalRevenues,
    mediaRevenues,
    expenseItems,
  } = useFinancial();
  const { teamData } = useTeam();
  const { fNum } = useCurrencyFormatters();
  const { isYearly } = useViewMode();
  const m = isYearly ? 12 : 1;

  const isMarketActive = (label: string) => {
    const key = label.toLowerCase() as keyof typeof activeMarkets;
    return activeMarkets[key] !== false;
  };

  // Team commission lookup
  const teamByLabel = useMemo(() => {
    const map = new Map<string, { rate: number; type: CommissionType }>();
    for (const member of teamData) {
      map.set(member.expenseLabel, { rate: member.commission.rate, type: member.commission.type });
    }
    return map;
  }, [teamData]);

  // Revenue by market (brand-aware) — same logic as ExpensesView
  const revenueByMarketYear = useMemo(() => {
    const years = ['y1', 'y2', 'y3'] as const;
    const result: Record<string, { y1: number; y2: number; y3: number }> = {};
    if (activeBrands.mInvest) {
      for (const sale of saleRevenues) {
        const key = sale.label.toLowerCase();
        if (!result[key]) result[key] = { y1: 0, y2: 0, y3: 0 };
        for (const y of years) result[key][y] += sale[y].total;
      }
    }
    if (activeBrands.feelHome) {
      for (const rental of rentalRevenues) {
        const key = rental.label.toLowerCase();
        if (!result[key]) result[key] = { y1: 0, y2: 0, y3: 0 };
        for (const y of years) result[key][y] += rental[y].total;
      }
    }
    return result;
  }, [activeBrands, saleRevenues, rentalRevenues]);

  const totalRevenueYear = useMemo(() => {
    const totals = { y1: 0, y2: 0, y3: 0 };
    for (const y of ['y1', 'y2', 'y3'] as const) {
      if (activeBrands.feelHome) totals[y] += rentalRevenues.reduce((s, i) => s + i[y].total, 0);
      if (activeBrands.mInvest) totals[y] += saleRevenues.reduce((s, i) => s + i[y].total, 0);
      if (activeBrands.expats) totals[y] += mediaRevenues.reduce((s, i) => s + i[y].total, 0);
    }
    return totals;
  }, [activeBrands, saleRevenues, rentalRevenues, mediaRevenues]);

  const getCommissionAmount = (item: ExpenseItem, year: 'y1' | 'y2' | 'y3'): number => {
    const info = teamByLabel.get(item.label);
    if (!info || info.type === 'No Commission') return 0;
    const rate = info.rate / 100;
    if (info.type === 'All Revenues') return rate * totalRevenueYear[year];
    if (info.type === 'All RE Revenues') {
      let total = 0;
      if (activeBrands.feelHome) total += rentalRevenues.reduce((s, i) => s + i[year].total, 0);
      if (activeBrands.mInvest) total += saleRevenues.reduce((s, i) => s + i[year].total, 0);
      return rate * total;
    }
    if (item.market) {
      const marketRev = revenueByMarketYear[item.market];
      return marketRev ? rate * marketRev[year] : 0;
    }
    let total = 0;
    if (activeBrands.feelHome) total += rentalRevenues.reduce((s, i) => s + i[year].total, 0);
    if (activeBrands.mInvest) total += saleRevenues.reduce((s, i) => s + i[year].total, 0);
    return rate * total;
  };

  const activeExpenses = expenseItems
    .filter((item) => isExpenseActive(item, activeBrands, activeMarkets));

  const grouped = {
    salaries: activeExpenses.filter((item) => item.category === 'salaries'),
    fixed: activeExpenses.filter((item) => item.category === 'fixed'),
    marketing: activeExpenses.filter((item) => item.category === 'marketing'),
  };

  // Revenue totals per year (monthly)
  const revTotals: [number, number, number] = [
    yearly[0].revenue / 12,
    yearly[1].revenue / 12,
    yearly[2].revenue / 12,
  ];

  // Expense totals per year (monthly)
  const expTotals: [number, number, number] = [
    yearly[0].expenses / 12,
    yearly[1].expenses / 12,
    yearly[2].expenses / 12,
  ];

  // Commission totals
  const commTotals: [number, number, number] = [0, 0, 0];
  for (const item of activeExpenses) {
    commTotals[0] += getCommissionAmount(item, 'y1');
    commTotals[1] += getCommissionAmount(item, 'y2');
    commTotals[2] += getCommissionAmount(item, 'y3');
  }

  // Net profit = revenue - expenses - commissions
  const netTotals: [number, number, number] = [
    revTotals[0] - expTotals[0] - commTotals[0],
    revTotals[1] - expTotals[1] - commTotals[1],
    revTotals[2] - expTotals[2] - commTotals[2],
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── REVENUES SECTION ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-2 h-2 rounded-full bg-[#d4a853]" />
          <span className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Revenues</span>
        </div>

        {/* Feel Home */}
        {activeBrands.feelHome && (
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="w-full md:w-1/2 flex items-center gap-3 px-1">
                <BrandAvatar brand={brands.feelHome} size={20} />
                <span className="text-[12px] font-semibold text-white/70">{brands.feelHome.name}</span>
              </div>
              <div className="w-full md:w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center"><YearTag year={n} color="#d4875a" /></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="card overflow-x-auto w-full md:w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">City</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {rentalRevenues.map((item) => (
                      <tr key={item.label} className={`border-b border-white/[0.02] h-[37px] ${isMarketActive(item.label) ? '' : 'opacity-25'}`}>
                        <td className="px-4 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-white/[0.06]">
                      <td className="px-4 py-2 text-[11px] font-bold text-[#d4875a] uppercase tracking-wider">Total</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full md:w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {rentalRevenues.map((item) => (
                          <tr key={item.label} className={`border-b border-white/[0.02] h-[37px] ${isMarketActive(item.label) ? '' : 'opacity-25'}`}>
                            <td className="px-3 text-center font-mono text-white/50 whitespace-nowrap">
                              {item[y].total > 0 ? fNum(item[y].total * m) : <span className="text-white/15">—</span>}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-2 text-center font-mono text-[13px] font-bold text-[#d4875a] whitespace-nowrap">
                            {fNum(rentalRevenues.filter(r => isMarketActive(r.label)).reduce((s, r) => s + r[y].total, 0) * m)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* M Invest */}
        {activeBrands.mInvest && (
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="w-full md:w-1/2 flex items-center gap-3 px-1">
                <BrandAvatar brand={brands.mInvest} size={20} />
                <span className="text-[12px] font-semibold text-white/70">{brands.mInvest.name}</span>
              </div>
              <div className="w-full md:w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center"><YearTag year={n} color="#5b8ec9" /></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="card overflow-x-auto w-full md:w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">City</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {saleRevenues.map((item) => (
                      <tr key={item.label} className={`border-b border-white/[0.02] h-[37px] ${isMarketActive(item.label) ? '' : 'opacity-25'}`}>
                        <td className="px-4 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-white/[0.06]">
                      <td className="px-4 py-2 text-[11px] font-bold text-[#5b8ec9] uppercase tracking-wider">Total</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full md:w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {saleRevenues.map((item) => (
                          <tr key={item.label} className={`border-b border-white/[0.02] h-[37px] ${isMarketActive(item.label) ? '' : 'opacity-25'}`}>
                            <td className="px-3 text-center font-mono text-white/50 whitespace-nowrap">
                              {item[y].total > 0 ? fNum(item[y].total * m) : <span className="text-white/15">—</span>}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-2 text-center font-mono text-[13px] font-bold text-[#5b8ec9] whitespace-nowrap">
                            {fNum(saleRevenues.filter(r => isMarketActive(r.label)).reduce((s, r) => s + r[y].total, 0) * m)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expats.ma */}
        {activeBrands.expats && (
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="w-full md:w-1/2 flex items-center gap-3 px-1">
                <BrandAvatar brand={brands.expats} size={20} />
                <span className="text-[12px] font-semibold text-white/70">{brands.expats.name}</span>
              </div>
              <div className="w-full md:w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center"><YearTag year={n} color="#1d7ff3" /></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="card overflow-x-auto w-full md:w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {mediaRevenues.map((item) => (
                      <tr key={item.label} className="border-b border-white/[0.02] h-[37px]">
                        <td className="px-4 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-white/[0.06]">
                      <td className="px-4 py-2 text-[11px] font-bold text-[#1d7ff3] uppercase tracking-wider">Total</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full md:w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {mediaRevenues.map((item) => (
                          <tr key={item.label} className="border-b border-white/[0.02] h-[37px]">
                            <td className="px-3 text-center font-mono text-white/50 whitespace-nowrap">
                              {item[y].total > 0 ? fNum(item[y].total * m) : <span className="text-white/15">—</span>}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-2 text-center font-mono text-[13px] font-bold text-[#1d7ff3] whitespace-nowrap">
                            {fNum(mediaRevenues.reduce((s, r) => s + r[y].total, 0) * m)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <SectionBar
          label={isYearly ? 'Total Yearly Revenue' : 'Total Monthly Revenue'}
          values={[revTotals[0] * m, revTotals[1] * m, revTotals[2] * m]}
          color="#d4a853"
        />
      </div>

      {/* ─── EXPENSES SECTION ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
          <span className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Expenses</span>
        </div>

        {(['salaries', 'fixed', 'marketing'] as const).map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          const config = categoryConfig[cat];
          const isSalaries = cat === 'salaries';

          return (
            <div key={cat} className="space-y-2">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="w-full md:w-1/2 flex items-center gap-3 px-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${config.color}15`, border: `1px solid ${config.color}25` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                  </div>
                  <span className="text-[12px] font-semibold text-white/70">{config.label}</span>
                </div>
                <div className="w-full md:w-1/2 flex gap-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex-1 text-center"><YearTag year={n} color={config.color} /></div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="card overflow-x-auto w-full md:w-1/2">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                        <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">Expense</th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">Brands</th>
                      </tr>
                    </thead>
                    <tbody className="zebra-rows">
                      {items.map((item) => (
                        <tr key={item.label} className="border-b border-white/[0.02] h-[37px]">
                          <td className="px-4 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                          <td className="px-3">
                            <div className="flex gap-1 flex-nowrap">
                              {item.brands.map((b) => <BrandPill key={b} brandKey={b} />)}
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-white/[0.06]">
                        <td colSpan={2} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: config.color }}>Total</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="w-full md:w-1/2 flex gap-3">
                  {(['y1', 'y2', 'y3'] as const).map((y) => (
                    <div key={y} className="card overflow-hidden flex-1 min-w-0">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                            <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">{isSalaries ? 'Salary' : 'Amount'}</th>
                            {isSalaries && (
                              <th className="px-2 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Comm.</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="zebra-rows">
                          {items.map((item) => {
                            const commAmount = isSalaries ? getCommissionAmount(item, y) : 0;
                            return (
                              <tr key={item.label} className="border-b border-white/[0.02] h-[37px]">
                                <td className="px-3 text-center font-mono text-white/50 whitespace-nowrap">
                                  {item[y] > 0 ? fNum(item[y] * m) : <span className="text-white/15">—</span>}
                                </td>
                                {isSalaries && (
                                  <td className="px-2 text-center font-mono text-[11px] whitespace-nowrap" style={{ color: commAmount > 0 ? '#f43f5e' : undefined, opacity: commAmount > 0 ? 0.7 : 0.2 }}>
                                    {commAmount > 0 ? fNum(Math.round(commAmount * m)) : '—'}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          <tr className="border-t border-white/[0.06]">
                            <td className="px-3 py-2 text-center font-mono text-[13px] font-bold whitespace-nowrap" style={{ color: config.color }}>
                              {fNum(items.reduce((s, item) => s + item[y], 0) * m)}
                            </td>
                            {isSalaries && (
                              <td className="px-2 py-2 text-center font-mono text-[11px] font-bold whitespace-nowrap" style={{ color: '#f43f5e', opacity: 0.9 }}>
                                {fNum(Math.round(items.reduce((s, item) => s + getCommissionAmount(item, y), 0) * m))}
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <SectionBar
          label={isYearly ? 'Total Yearly Expenses' : 'Total Monthly Expenses'}
          values={[expTotals[0] * m, expTotals[1] * m, expTotals[2] * m]}
          color="#f43f5e"
        />
      </div>

      {/* ─── BOTTOM LINE TABLE ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
          <span className="text-[13px] font-bold text-white/80 uppercase tracking-wider">Bottom Line</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="w-full md:w-1/2" />
          <div className="w-full md:w-1/2 flex gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex-1 text-center"><YearTag year={n} color="#2dd4bf" /></div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="card overflow-x-auto w-full md:w-1/2">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">Metric</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Total Revenues', color: '#2dd4bf' },
                  { label: 'Total Expenses', color: '#f43f5e' },
                  { label: 'Total Commissions', color: '#e879a0' },
                  { label: 'Net Profit', color: 'auto' },
                  { label: 'Cumulative P&L', color: 'auto' },
                ].map((row) => (
                  <tr key={row.label} className={`border-b border-white/[0.02] h-[42px] ${row.label === 'Net Profit' || row.label === 'Cumulative P&L' ? '!bg-white/[0.03]' : ''}`}>
                    <td className="px-4 text-[12px] font-bold text-white/80 whitespace-nowrap">{row.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full md:w-1/2 flex gap-3">
            {([0, 1, 2] as const).map((yi) => {
              const cumulative = (() => {
                let total = 0;
                for (let i = 0; i <= yi; i++) {
                  total += (revTotals[i] - expTotals[i] - commTotals[i]) * 12;
                }
                return total;
              })();

              const rows = [
                { value: revTotals[yi] * m, color: '#2dd4bf' },
                { value: expTotals[yi] * m, color: '#f43f5e' },
                { value: commTotals[yi] * m, color: '#e879a0' },
                { value: netTotals[yi] * m, color: 'auto' as const },
                { value: isYearly ? cumulative : cumulative / 12, color: 'auto' as const },
              ];

              return (
                <div key={yi} className="card overflow-hidden flex-1 min-w-0">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                        <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, ri) => {
                        const isAutoColor = row.color === 'auto';
                        const cellColor = isAutoColor
                          ? (row.value >= 0 ? '#22c55e' : '#f43f5e')
                          : row.color;
                        const isHighlight = ri >= 3;
                        return (
                          <tr key={ri} className={`border-b border-white/[0.02] h-[42px] ${isHighlight ? '!bg-white/[0.03]' : ''}`}>
                            <td className="px-3 text-center font-mono text-[13px] font-bold whitespace-nowrap" style={{ color: cellColor }}>
                              {fNum(Math.round(row.value))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
