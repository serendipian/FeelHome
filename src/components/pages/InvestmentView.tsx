'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber, formatPercent } from '@/lib/formatters';
import { isExpenseActive } from '@/lib/calculations';
import { loadFromSupabase, saveToSupabase } from '@/lib/supabase';
import { MonthlySnapshot } from '@/types';
import KPICard from '@/components/ui/KPICard';
import EditableCell from '@/components/ui/EditableCell';

const MONTHS = 6;
const COLLAPSE_FROM_LABEL = 'Agent Casablanca #2';

interface SimData {
  rentalConvs: number[][]; // [itemIdx][monthIdx]
  saleConvs: number[][];
  mediaConvs: number[][];
  expenses: number[][];   // [itemIdx][monthIdx]
}

export default function InvestmentView() {
  const {
    investment, setInvestment,
    growthBoost, setGrowthBoost,
    simulation,
    activeBrands,
    activeMarkets,
    saleRevenues,
    rentalRevenues,
    mediaRevenues,
    expenseItems,
  } = useFinancial();

  const isMarketActive = useCallback((label: string) => {
    const key = label.toLowerCase() as keyof typeof activeMarkets;
    return activeMarkets[key] !== false;
  }, [activeMarkets]);

  const { breakEvenMonth, roi, finalCash } = simulation;

  const tableMonths = [1, 2, 3, 4, 5, 6];
  const [salariesExpanded, setSalariesExpanded] = useState(false);

  // Find index where collapsible salaries start
  const collapseFromIdx = expenseItems.findIndex(e => e.label === COLLAPSE_FROM_LABEL);

  // Local simulation state — independent per-month, initialized from Y1 or localStorage
  const [sim, setSim] = useState<SimData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('feelhome-simdata');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {
      rentalConvs: rentalRevenues.map(item => Array(MONTHS).fill(item.y1.conv)),
      saleConvs: saleRevenues.map(item => Array(MONTHS).fill(item.y1.conv)),
      mediaConvs: mediaRevenues.map(item => Array(MONTHS).fill(item.y1.conv)),
      expenses: expenseItems.map(item => Array(MONTHS).fill(item.y1)),
    };
  });

  // Sync sim data to localStorage + Supabase
  const simTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    try { localStorage.setItem('feelhome-simdata', JSON.stringify(sim)); } catch {}
    clearTimeout(simTimer.current);
    simTimer.current = setTimeout(() => { saveToSupabase('simdata', sim); }, 500);
  }, [sim]);

  // Load sim data from Supabase on mount
  const simHydrated = useRef(false);
  useEffect(() => {
    if (simHydrated.current) return;
    simHydrated.current = true;
    loadFromSupabase<SimData>('simdata', sim).then((data) => setSim(data));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSimRental = (itemIdx: number, monthIdx: number, conv: number) => {
    setSim(prev => {
      const next = { ...prev, rentalConvs: prev.rentalConvs.map(a => [...a]) };
      next.rentalConvs[itemIdx][monthIdx] = conv;
      return next;
    });
  };

  const updateSimSale = (itemIdx: number, monthIdx: number, conv: number) => {
    setSim(prev => {
      const next = { ...prev, saleConvs: prev.saleConvs.map(a => [...a]) };
      next.saleConvs[itemIdx][monthIdx] = conv;
      return next;
    });
  };

  const updateSimMedia = (itemIdx: number, monthIdx: number, conv: number) => {
    setSim(prev => {
      const next = { ...prev, mediaConvs: prev.mediaConvs.map(a => [...a]) };
      next.mediaConvs[itemIdx][monthIdx] = conv;
      return next;
    });
  };

  const updateSimExpense = (itemIdx: number, monthIdx: number, amount: number) => {
    setSim(prev => {
      const next = { ...prev, expenses: prev.expenses.map(a => [...a]) };
      next.expenses[itemIdx][monthIdx] = amount;
      return next;
    });
  };

  // Compute local snapshots from local sim data
  const localSnapshots: MonthlySnapshot[] = useMemo(() => {
    const snaps: MonthlySnapshot[] = [];
    let cumulative = 0;

    for (let mi = 0; mi < MONTHS; mi++) {
      let revenue = 0;
      const revByBrand = { feelHome: 0, mInvest: 0, expats: 0 };

      if (activeBrands.feelHome) {
        rentalRevenues.forEach((item, i) => {
          if (isMarketActive(item.label)) {
            const val = (sim.rentalConvs[i]?.[mi] ?? 0) * item.revPerConv;
            revByBrand.feelHome += val;
            revenue += val;
          }
        });
      }

      if (activeBrands.mInvest) {
        saleRevenues.forEach((item, i) => {
          if (isMarketActive(item.label)) {
            const val = (sim.saleConvs[i]?.[mi] ?? 0) * item.revPerConv;
            revByBrand.mInvest += val;
            revenue += val;
          }
        });
      }

      if (activeBrands.expats) {
        mediaRevenues.forEach((item, i) => {
          const val = (sim.mediaConvs[i]?.[mi] ?? 0) * item.unitPrice;
          revByBrand.expats += val;
          revenue += val;
        });
      }

      // Apply growth boost
      const boost = 1 + growthBoost;
      revenue *= boost;
      revByBrand.feelHome *= boost;
      revByBrand.mInvest *= boost;
      revByBrand.expats *= boost;

      const commByBrand = {
        feelHome: revByBrand.feelHome * 0.25,
        mInvest: revByBrand.mInvest * 0.25,
        expats: 0,
      };
      const commissions = commByBrand.feelHome + commByBrand.mInvest;

      let expensesTotal = 0;
      const expByCategory = { salaries: 0, fixed: 0, marketing: 0 };
      expenseItems.forEach((item, i) => {
        if (isExpenseActive(item, activeBrands)) {
          const val = sim.expenses[i]?.[mi] ?? 0;
          expByCategory[item.category] += val;
          expensesTotal += val;
        }
      });

      const profit = revenue - commissions - expensesTotal;
      cumulative += profit;
      const balance = investment + cumulative;

      snaps.push({
        month: mi + 1, revenue, expenses: expensesTotal, commissions, commByBrand, profit, cumulative, balance,
        revByBrand, expByCategory,
      });
    }

    return snaps;
  }, [sim, activeBrands, activeMarkets, rentalRevenues, saleRevenues, mediaRevenues, expenseItems, investment, growthBoost, isMarketActive]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sliders */}
      <div className="grid grid-cols-2 gap-5">
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

      {/* Pre-launch Simulation — separate cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-[13px] font-semibold text-white/70">Pre-launch Simulation</h3>
          <p className="text-[11px] text-white/25 mt-0.5">6-month micro cash flow — independent from main projections</p>
        </div>

        {/* REVENUE CARD */}
        <SimCard title="Revenue" tableMonths={tableMonths}>
          {activeBrands.feelHome && (
            <>
              <CashFlowRow label="Feel Home (Rental)" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.revByBrand.feelHome} color="#d4875a" bold />
              {rentalRevenues.map((item, idx) => {
                const active = isMarketActive(item.label);
                return (
                  <tr key={`rental-${idx}`} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:bg-white/[0.015]' : 'opacity-20'}`}>
                    <td className="pl-10 pr-3 py-2 text-[10px] text-white/35 whitespace-nowrap">{item.label}</td>
                    {tableMonths.map((m) => {
                      const mi = m - 1;
                      const conv = sim.rentalConvs[idx]?.[mi] ?? 0;
                      const total = conv * item.revPerConv;
                      return (
                        <td key={m} className="px-2 py-2 text-center font-mono text-[11px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <EditableCell
                              value={conv}
                              onSave={(v) => updateSimRental(idx, mi, v)}
                              format={(v) => String(Math.round(v))}
                              className="text-white/30"
                            />
                            <span className="text-white/15">×</span>
                            <span style={{ color: '#d4875a' }}>
                              {total > 0 ? formatNumber(Math.round(total)) : '—'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </>
          )}

          {activeBrands.mInvest && (
            <>
              <CashFlowRow label="M Invest (Sales)" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.revByBrand.mInvest} color="#5b8ec9" bold />
              {saleRevenues.map((item, idx) => {
                const active = isMarketActive(item.label);
                return (
                  <tr key={`sale-${idx}`} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:bg-white/[0.015]' : 'opacity-20'}`}>
                    <td className="pl-10 pr-3 py-2 text-[10px] text-white/35 whitespace-nowrap">{item.label}</td>
                    {tableMonths.map((m) => {
                      const mi = m - 1;
                      const conv = sim.saleConvs[idx]?.[mi] ?? 0;
                      const total = conv * item.revPerConv;
                      return (
                        <td key={m} className="px-2 py-2 text-center font-mono text-[11px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <EditableCell
                              value={conv}
                              onSave={(v) => updateSimSale(idx, mi, v)}
                              format={(v) => String(Math.round(v))}
                              className="text-white/30"
                            />
                            <span className="text-white/15">×</span>
                            <span style={{ color: '#5b8ec9' }}>
                              {total > 0 ? formatNumber(Math.round(total)) : '—'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </>
          )}

          {activeBrands.expats && (
            <>
              <CashFlowRow label="Expats.ma (Media)" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.revByBrand.expats} color="#1d7ff3" bold />
              {mediaRevenues.map((item, idx) => (
                <tr key={`media-${idx}`} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                  <td className="pl-10 pr-3 py-2 text-[10px] text-white/35 whitespace-nowrap">{item.label}</td>
                  {tableMonths.map((m) => {
                    const mi = m - 1;
                    const conv = sim.mediaConvs[idx]?.[mi] ?? 0;
                    const total = conv * item.unitPrice;
                    return (
                      <td key={m} className="px-2 py-2 text-center font-mono text-[11px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <EditableCell
                            value={conv}
                            onSave={(v) => updateSimMedia(idx, mi, v)}
                            format={(v) => String(Math.round(v))}
                            className="text-white/30"
                          />
                          <span className="text-white/15">×</span>
                          <span style={{ color: '#1d7ff3' }}>
                            {total > 0 ? formatNumber(Math.round(total)) : '—'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          )}

          <CashFlowRow label="Total Revenue" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.revenue} color="#2dd4bf" bold />
        </SimCard>

        {/* EXPENSES CARD */}
        <SimCard title="Expenses" tableMonths={tableMonths}>
          {/* Salaries */}
          <CashFlowRow label="Salaries" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.expByCategory.salaries} color="#f43f5e" bold />
          {expenseItems.map((item, idx) => {
            if (item.category !== 'salaries' || !isExpenseActive(item, activeBrands)) return null;
            const isCollapsed = collapseFromIdx > 0 && idx >= collapseFromIdx && !salariesExpanded;
            if (isCollapsed) return null;
            return (
              <tr key={`exp-${idx}`} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                <td className="pl-10 pr-3 py-2 text-[10px] text-white/35 whitespace-nowrap">{item.label}</td>
                {tableMonths.map((m) => {
                  const mi = m - 1;
                  return (
                    <td key={m} className="px-3 py-2 text-center font-mono text-[11px]" style={{ color: '#f43f5e' }}>
                      <EditableCell
                        value={sim.expenses[idx]?.[mi] ?? 0}
                        onSave={(v) => updateSimExpense(idx, mi, v)}
                        format={(v) => v === 0 ? '—' : formatNumber(Math.round(v))}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {collapseFromIdx > 0 && (
            <tr className="border-b border-white/[0.02]">
              <td colSpan={tableMonths.length + 1} className="px-10 py-1.5">
                <button
                  onClick={() => setSalariesExpanded(!salariesExpanded)}
                  className="text-[10px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1"
                >
                  <svg className={`w-3 h-3 transition-transform ${salariesExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {salariesExpanded ? 'Collapse future hires' : `Show ${expenseItems.filter((e, i) => e.category === 'salaries' && i >= collapseFromIdx && isExpenseActive(e, activeBrands)).length} future hires`}
                </button>
              </td>
            </tr>
          )}

          {/* Fixed Costs */}
          <CashFlowRow label="Fixed Costs" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.expByCategory.fixed} color="#f43f5e" bold />
          {expenseItems.map((item, idx) => {
            if (item.category !== 'fixed' || !isExpenseActive(item, activeBrands)) return null;
            return (
              <tr key={`exp-${idx}`} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                <td className="pl-10 pr-3 py-2 text-[10px] text-white/35 whitespace-nowrap">{item.label}</td>
                {tableMonths.map((m) => {
                  const mi = m - 1;
                  return (
                    <td key={m} className="px-3 py-2 text-center font-mono text-[11px]" style={{ color: '#f43f5e' }}>
                      <EditableCell
                        value={sim.expenses[idx]?.[mi] ?? 0}
                        onSave={(v) => updateSimExpense(idx, mi, v)}
                        format={(v) => v === 0 ? '—' : formatNumber(Math.round(v))}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Marketing */}
          <CashFlowRow label="Marketing" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.expByCategory.marketing} color="#f43f5e" bold />
          {expenseItems.map((item, idx) => {
            if (item.category !== 'marketing' || !isExpenseActive(item, activeBrands)) return null;
            return (
              <tr key={`exp-${idx}`} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                <td className="pl-10 pr-3 py-2 text-[10px] text-white/35 whitespace-nowrap">{item.label}</td>
                {tableMonths.map((m) => {
                  const mi = m - 1;
                  return (
                    <td key={m} className="px-3 py-2 text-center font-mono text-[11px]" style={{ color: '#f43f5e' }}>
                      <EditableCell
                        value={sim.expenses[idx]?.[mi] ?? 0}
                        onSave={(v) => updateSimExpense(idx, mi, v)}
                        format={(v) => v === 0 ? '—' : formatNumber(Math.round(v))}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}

          <CashFlowRow label="Total Expenses" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.expenses} color="#f43f5e" bold />
        </SimCard>

        {/* COMMISSIONS CARD */}
        <SimCard title="Commissions (25%)" tableMonths={tableMonths}>
          {activeBrands.feelHome && (
            <CashFlowRow label="Feel Home" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.commByBrand.feelHome} color="#d4875a" />
          )}
          {activeBrands.mInvest && (
            <CashFlowRow label="M Invest" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.commByBrand.mInvest} color="#5b8ec9" />
          )}

          <CashFlowRow label="Total Commissions" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.commissions} color="#f59e0b" bold />
        </SimCard>

        {/* BOTTOM LINE CARD */}
        <SimCard title="Bottom Line" tableMonths={tableMonths}>
          <CashFlowRow label="Net Profit" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.profit} autoColor />
          <CashFlowRow label="Cumulative P&L" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.cumulative} autoColor />
          <CashFlowRow label="Cash Balance" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.balance} autoColor bold highlight />
        </SimCard>
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

function SimCard({ title, tableMonths, children }: { title: string; tableMonths: number[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            <th className="px-5 py-3 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider w-[180px]">{title}</th>
            {tableMonths.map((m) => (
              <th key={m} className="px-3 py-3 text-[10px] font-semibold text-white/40 text-center uppercase tracking-wider">
                Month {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function CashFlowRow({
  label, months, snapshots, getValue, color, autoColor, bold, highlight,
}: {
  label: string;
  months: number[];
  snapshots: MonthlySnapshot[];
  getValue: (s: MonthlySnapshot) => number;
  color?: string;
  autoColor?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={`border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors ${highlight ? 'bg-white/[0.02]' : ''}`}>
      <td className={`px-5 py-2.5 whitespace-nowrap ${bold ? 'font-bold text-white/80 text-[12px]' : 'text-white/45 text-[11px] pl-8'}`}>
        {label}
      </td>
      {months.map((m) => {
        const snap = snapshots[m - 1];
        if (!snap) return <td key={m} />;
        const val = getValue(snap);
        const cellColor = autoColor
          ? val >= 0 ? '#2dd4bf' : '#f43f5e'
          : color || '#ffffff80';
        return (
          <td
            key={m}
            className={`px-3 py-2.5 text-center font-mono ${bold ? 'font-bold text-[12px]' : 'text-[11px]'}`}
            style={{ color: cellColor }}
          >
            {val === 0 ? '—' : formatNumber(Math.round(val))}
          </td>
        );
      })}
    </tr>
  );
}
