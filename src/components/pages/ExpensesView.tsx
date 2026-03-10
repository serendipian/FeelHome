'use client';

import { useFinancial } from '@/context/FinancialContext';
import { formatNumber } from '@/lib/formatters';
import { isExpenseActive } from '@/lib/calculations';
import { ExpenseItem } from '@/types';
import BrandPill from '@/components/ui/BrandPill';
import TotalBar from '@/components/ui/TotalBar';
import EditableCell from '@/components/ui/EditableCell';

const categoryConfig: Record<string, { label: string; color: string; subtitle: string }> = {
  salaries: { label: 'Salaries', color: '#f43f5e', subtitle: 'Team & Agents' },
  fixed: { label: 'Fixed Costs', color: '#5b8ec9', subtitle: 'Office, Tools & Operations' },
  marketing: { label: 'Marketing', color: '#1d7ff3', subtitle: 'Acquisition & Branding' },
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
  const { activeBrands, expenseItems, updateExpenseItem, yearly } = useFinancial();

  const activeItems = expenseItems
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => isExpenseActive(item, activeBrands));

  const grouped = {
    salaries: activeItems.filter(({ item }) => item.category === 'salaries'),
    fixed: activeItems.filter(({ item }) => item.category === 'fixed'),
    marketing: activeItems.filter(({ item }) => item.category === 'marketing'),
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {(['salaries', 'fixed', 'marketing'] as const).map((cat) => {
        const items = grouped[cat];
        if (items.length === 0) return null;
        const config = categoryConfig[cat];

        return (
          <div key={cat} className="space-y-3">
            {/* Category Header with year tags */}
            <div className="flex gap-3 items-end">
              <div className="w-1/2 flex items-center gap-4 px-1 pb-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${config.color}15`, border: `1px solid ${config.color}25` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                </div>
                <div>
                  <span className="text-[14px] font-semibold text-white/90">{config.label}</span>
                  <p className="text-[11px] text-white/30 mt-0.5">{config.subtitle}</p>
                </div>
              </div>
              <div className="w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center">
                    <YearTag year={n} color={config.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Cards row */}
            <div className="flex gap-3 items-stretch">
              {/* Left card: expense label, brands, variable cost */}
              <div className="card overflow-hidden w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Expense</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Brands</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Var. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ item, idx }) => (
                      <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                        <td className="px-4 py-2.5 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {item.brands.map((b) => (
                              <BrandPill key={b} brandKey={b} />
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/30">
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
                  </tbody>
                </table>
              </div>

              {/* Right: 3 year cards */}
              <div className="w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-right uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(({ item, idx }) => (
                          <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                            <td className="px-3 py-2.5 text-right font-mono text-white/50">
                              {item[y] > 0 ? (
                                <EditableCell
                                  value={item[y]}
                                  onSave={(v) => updateExpenseItem(idx, y, v)}
                                  format={formatNumber}
                                />
                              ) : (
                                <EditableCell
                                  value={item[y]}
                                  onSave={(v) => updateExpenseItem(idx, y, v)}
                                  format={(v) => v === 0 ? '—' : formatNumber(v)}
                                  className="text-white/15"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                        {/* Subtotal row */}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-3 text-right font-mono text-[13px] font-bold whitespace-nowrap" style={{ color: config.color }}>
                            {formatNumber(items.reduce((s, { item }) => s + item[y], 0))}
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
