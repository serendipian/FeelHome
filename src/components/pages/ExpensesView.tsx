'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatNumber } from '@/lib/formatters';
import { useCurrencyFormatters } from '@/context/CurrencyContext';
import { isExpenseActive } from '@/lib/calculations';
import { ExpenseItem } from '@/types';
import { useTeam } from '@/context/TeamContext';
import type { CommissionType } from '@/types/team';
import BrandPill from '@/components/ui/BrandPill';
import TotalBar from '@/components/ui/TotalBar';
import EditableCell from '@/components/ui/EditableCell';

const COMMISSION_TYPES: CommissionType[] = ['All Revenues', 'All RE Revenues', 'Linked Deals', 'No Commission'];

const categoryConfig: Record<string, { label: string; color: string; subtitle: string }> = {
  salaries: { label: 'Salaries', color: '#f43f5e', subtitle: 'Team & Agents' },
  fixed: { label: 'Fixed Costs', color: '#f43f5e', subtitle: 'Office, Tools & Operations' },
  marketing: { label: 'Marketing', color: '#f43f5e', subtitle: 'Acquisition & Branding' },
};

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

export default function ExpensesView() {
  const { activeBrands, activeMarkets, expenseItems, updateExpenseItem, yearly, saleRevenues, rentalRevenues, mediaRevenues } = useFinancial();
  const { teamData, updateTeamMember } = useTeam();
  const { fNum } = useCurrencyFormatters();
  const [salariesExpanded, setSalariesExpanded] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const m = isYearly ? 12 : 1; // multiplier

  // Map expense labels → team member data (id + commission)
  const teamByLabel = useMemo(() => {
    const map = new Map<string, { id: string; rate: number; type: CommissionType }>();
    for (const member of teamData) {
      map.set(member.expenseLabel, { id: member.id, rate: member.commission.rate, type: member.commission.type });
    }
    return map;
  }, [teamData]);

  // Update commission rate for a team member (from expense label)
  const handleCommissionRateChange = useCallback((expenseLabel: string, newRate: number) => {
    const info = teamByLabel.get(expenseLabel);
    if (!info) return;
    updateTeamMember(info.id, { commission: { rate: newRate, type: info.type } });
  }, [teamByLabel, updateTeamMember]);

  // Update commission type for a team member (from expense label)
  const handleCommissionTypeChange = useCallback((expenseLabel: string, newType: CommissionType) => {
    const info = teamByLabel.get(expenseLabel);
    if (!info) return;
    const newRate = newType === 'No Commission' ? 0 : info.rate;
    updateTeamMember(info.id, { commission: { rate: newRate, type: newType } });
  }, [teamByLabel, updateTeamMember]);

  // Calculate revenues by market for each year (brand-aware)
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

  // Total revenues per year (FH + MI + Expats)
  const totalRevenueYear = useMemo(() => {
    const years = ['y1', 'y2', 'y3'] as const;
    const totals = { y1: 0, y2: 0, y3: 0 };
    for (const y of years) {
      if (activeBrands.feelHome) totals[y] += rentalRevenues.reduce((s, i) => s + i[y].total, 0);
      if (activeBrands.mInvest) totals[y] += saleRevenues.reduce((s, i) => s + i[y].total, 0);
      if (activeBrands.expats) totals[y] += mediaRevenues.reduce((s, i) => s + i[y].total, 0);
    }
    return totals;
  }, [activeBrands, saleRevenues, rentalRevenues, mediaRevenues]);

  // Calculate commission amount for a given expense item and year
  const getCommissionAmount = (item: ExpenseItem, year: 'y1' | 'y2' | 'y3'): number => {
    const info = teamByLabel.get(item.label);
    if (!info || info.type === 'No Commission') return 0;
    const rate = info.rate / 100;

    if (info.type === 'All Revenues') {
      return rate * totalRevenueYear[year];
    }

    // All RE Revenues: FH + MI only (no Expats.ma), all markets
    if (info.type === 'All RE Revenues') {
      let total = 0;
      if (activeBrands.feelHome) total += rentalRevenues.reduce((s, i) => s + i[year].total, 0);
      if (activeBrands.mInvest) total += saleRevenues.reduce((s, i) => s + i[year].total, 0);
      return rate * total;
    }

    // Linked Deals: use the expense's market if available
    if (item.market) {
      const marketRev = revenueByMarketYear[item.market];
      return marketRev ? rate * marketRev[year] : 0;
    }

    // Linked Deals without specific market: FH + MI revenues across all markets
    let total = 0;
    if (activeBrands.feelHome) total += rentalRevenues.reduce((s, i) => s + i[year].total, 0);
    if (activeBrands.mInvest) total += saleRevenues.reduce((s, i) => s + i[year].total, 0);
    return rate * total;
  };

  const activeItems = expenseItems
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => isExpenseActive(item, activeBrands, activeMarkets));

  const grouped = {
    salaries: activeItems.filter(({ item }) => item.category === 'salaries'),
    fixed: activeItems.filter(({ item }) => item.category === 'fixed'),
    marketing: activeItems.filter(({ item }) => item.category === 'marketing'),
  };

  // Split salaries: show up to "Agent Marrakech #1", collapse the rest
  const salaryCollapseIndex = grouped.salaries.findIndex(({ item }) => item.label === 'Agent Marrakech #1');
  const salaryVisibleCount = salaryCollapseIndex >= 0 ? salaryCollapseIndex + 1 : grouped.salaries.length;
  const salaryCollapsedCount = grouped.salaries.length - salaryVisibleCount;

  return (
    <div className="space-y-8 animate-fadeIn">
      {(['salaries', 'fixed', 'marketing'] as const).map((cat) => {
        const allItems = grouped[cat];
        if (allItems.length === 0) return null;
        const config = categoryConfig[cat];

        const isSalaries = cat === 'salaries';
        const items = isSalaries && !salariesExpanded
          ? allItems.slice(0, salaryVisibleCount)
          : allItems;

        return (
          <div key={cat} className="space-y-3">
            {/* Category Header with year tags */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="w-full md:w-1/2 flex items-center gap-4 px-1 pb-1">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: `${config.color}15`, border: `1px solid ${config.color}25` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                </div>
                <div>
                  <span className="text-[14px] font-semibold text-white/90">{config.label}</span>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex gap-3 overflow-x-auto">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center">
                    <YearTag year={n} color={config.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Cards row */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {/* Left card: expense label, brands, commission info */}
              <div className="card overflow-x-auto w-full md:w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Expense</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Brands</th>
                      {isSalaries && (
                        <>
                          <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Comm.</th>
                          <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Type</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {items.map(({ item, idx }) => {
                      const info = isSalaries ? teamByLabel.get(item.label) : undefined;
                      const isNoComm = info?.type === 'No Commission';
                      return (
                        <tr key={idx} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors h-[37px]">
                          <td className="px-4 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                          <td className="px-3">
                            <div className="flex gap-1 flex-nowrap">
                              {item.brands.map((b) => (
                                <BrandPill key={b} brandKey={b} />
                              ))}
                            </div>
                          </td>
                          {isSalaries && (
                            <>
                              <td className="px-3 text-right font-mono text-white/40 whitespace-nowrap">
                                {info ? (
                                  isNoComm ? (
                                    <span className="text-white/20">—</span>
                                  ) : (
                                    <EditableCell
                                      value={info.rate}
                                      onSave={(v) => handleCommissionRateChange(item.label, v)}
                                      format={(v) => `${v}%`}
                                      step={1}
                                    />
                                  )
                                ) : '—'}
                              </td>
                              <td className="px-3 whitespace-nowrap text-[10px]">
                                {info ? (
                                  <select
                                    value={info.type}
                                    onChange={(e) => handleCommissionTypeChange(item.label, e.target.value as CommissionType)}
                                    className="bg-transparent text-white/40 text-[10px] border-none outline-none cursor-pointer hover:text-white/60 transition-colors appearance-none pr-3"
                                    style={{ backgroundImage: 'none' }}
                                  >
                                    {COMMISSION_TYPES.map((t) => (
                                      <option key={t} value={t} className="bg-[#0a0b0f] text-white/80">{t}</option>
                                    ))}
                                  </select>
                                ) : '—'}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                    {isSalaries && salaryCollapsedCount > 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-2">
                          <button
                            onClick={() => setSalariesExpanded(!salariesExpanded)}
                            className="text-[11px] text-white/30 hover:text-white/50 transition-colors cursor-pointer"
                          >
                            {salariesExpanded
                              ? '▲ Collapse future hires'
                              : `▼ Show ${salaryCollapsedCount} more future hires…`}
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Right: 3 year cards */}
              <div className="w-full md:w-1/2 flex gap-3 overflow-x-auto">
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
                        {items.map(({ item, idx }) => {
                          const commAmount = isSalaries ? getCommissionAmount(item, y) : 0;
                          return (
                            <tr key={idx} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors h-[37px]">
                              <td className="px-3 text-center font-mono text-white/50">
                                {item[y] > 0 ? (
                                  <EditableCell
                                    value={item[y]}
                                    onSave={(v) => updateExpenseItem(idx, y, v)}
                                    format={fNum}
                                  />
                                ) : (
                                  <EditableCell
                                    value={item[y]}
                                    onSave={(v) => updateExpenseItem(idx, y, v)}
                                    format={(v) => v === 0 ? '—' : fNum(v)}
                                    className="text-white/15"
                                  />
                                )}
                              </td>
                              {isSalaries && (
                                <td className="px-2 text-center font-mono text-[11px] whitespace-nowrap" style={{ color: commAmount > 0 ? '#f43f5e' : undefined, opacity: commAmount > 0 ? 0.7 : 0.2 }}>
                                  {commAmount > 0 ? fNum(commAmount) : '—'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {isSalaries && salaryCollapsedCount > 0 && (
                          <tr>
                            <td colSpan={2} className="px-3 py-2">
                              <button
                                onClick={() => setSalariesExpanded(!salariesExpanded)}
                                className="text-[11px] text-white/30 hover:text-white/50 transition-colors w-full text-center cursor-pointer"
                              >
                                {salariesExpanded ? '▲' : '▼'}
                              </button>
                            </td>
                          </tr>
                        )}
                        {/* Subtotal row */}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-3 text-center font-mono text-[13px] font-bold whitespace-nowrap" style={{ color: config.color }}>
                            {fNum(allItems.reduce((s, { item }) => s + item[y], 0))}
                          </td>
                          {isSalaries && (
                            <td className="px-2 py-3 text-center font-mono text-[11px] font-bold whitespace-nowrap" style={{ color: '#f43f5e', opacity: 0.9 }}>
                              {fNum(allItems.reduce((s, { item }) => s + getCommissionAmount(item, y), 0))}
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

      <TotalBar
        label="Total Monthly Expenses"
        values={[yearly[0].expenses / 12, yearly[1].expenses / 12, yearly[2].expenses / 12]}
        color="#f43f5e"
      />
    </div>
  );
}
