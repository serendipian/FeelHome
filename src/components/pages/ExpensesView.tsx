'use client';

import { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatNumber } from '@/lib/formatters';
import { useCurrencyFormatters } from '@/context/CurrencyContext';
import { isExpenseActive } from '@/lib/calculations';
import { ExpenseItem } from '@/types';
import BrandPill from '@/components/ui/BrandPill';
import TotalBar from '@/components/ui/TotalBar';
import EditableCell from '@/components/ui/EditableCell';

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
  const { activeBrands, activeMarkets, expenseItems, updateExpenseItem, yearly } = useFinancial();
  const { fNum } = useCurrencyFormatters();
  const [salariesExpanded, setSalariesExpanded] = useState(false);

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
              {/* Left card: expense label, brands, variable cost */}
              <div className="card overflow-x-auto w-full md:w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Expense</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Brands</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Var. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {items.map(({ item, idx }) => (
                      <tr key={idx} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors h-[37px]">
                        <td className="px-4 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                        <td className="px-3">
                          <div className="flex gap-1 flex-nowrap">
                            {item.brands.map((b) => (
                              <BrandPill key={b} brandKey={b} />
                            ))}
                          </div>
                        </td>
                        <td className="px-3 text-right font-mono text-white/30">
                          <EditableCell
                            value={item.variableCost}
                            onSave={(v) => updateExpenseItem(idx, 'variableCost', v)}
                            isPercent
                            format={(v) => `${(v * 100).toFixed(0)}%`}
                            step={1}
                          />
                        </td>
                      </tr>
                    ))}
                    {isSalaries && salaryCollapsedCount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2">
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
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {items.map(({ item, idx }) => (
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
                          </tr>
                        ))}
                        {isSalaries && salaryCollapsedCount > 0 && (
                          <tr>
                            <td className="px-3 py-2">
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
