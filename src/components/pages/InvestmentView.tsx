'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFinancial, ScenarioKey } from '@/context/FinancialContext';
import { formatNumber } from '@/lib/formatters';
import { isExpenseActive } from '@/lib/calculations';
import { loadFromSupabase, saveToSupabase, ensureMigrated } from '@/lib/supabase';
import { defaultSaleRevenues, defaultRentalRevenues, defaultMediaRevenues } from '@/data/revenues';
import { defaultExpenses } from '@/data/expenses';
import { MonthlySnapshot } from '@/types';
import EditableCell from '@/components/ui/EditableCell';

const MONTHS = 6;
const COLLAPSE_FROM_LABEL = 'Agent Casablanca #2';

interface SimData {
  rentalConvs: number[][]; // [itemIdx][monthIdx]
  saleConvs: number[][];
  mediaConvs: number[][];
  expenses: number[][];   // [itemIdx][monthIdx]
}

// Label-keyed format for order-independent Supabase storage
type LabeledSimData = Record<string, { type: string; months: number[] }>;

// All 3 scenarios stored together in one Supabase key
type ScenariosStore = Record<ScenarioKey, LabeledSimData>;

const SUPABASE_KEY = 'simdata_v2';

// Static zeroed sim (no conversions, default expenses)
const ZEROED_SIM: SimData = {
  rentalConvs: defaultRentalRevenues.map(() => Array(MONTHS).fill(0)),
  saleConvs: defaultSaleRevenues.map(() => Array(MONTHS).fill(0)),
  mediaConvs: defaultMediaRevenues.map(() => Array(MONTHS).fill(0)),
  expenses: defaultExpenses.map(item => Array(MONTHS).fill(item.y1)),
};

function simToLabeled(s: SimData): LabeledSimData {
  const out: LabeledSimData = {};
  defaultRentalRevenues.forEach((item, i) => { out[`rental:${item.label}`] = { type: 'rental', months: s.rentalConvs[i] || Array(MONTHS).fill(0) }; });
  defaultSaleRevenues.forEach((item, i) => { out[`sale:${item.label}`] = { type: 'sale', months: s.saleConvs[i] || Array(MONTHS).fill(0) }; });
  defaultMediaRevenues.forEach((item, i) => { out[`media:${item.label}`] = { type: 'media', months: s.mediaConvs[i] || Array(MONTHS).fill(0) }; });
  defaultExpenses.forEach((item, i) => { out[`exp:${item.label}`] = { type: 'exp', months: s.expenses[i] || Array(MONTHS).fill(0) }; });
  return out;
}

function labeledToSim(labeled: LabeledSimData, fallback: SimData): SimData {
  return {
    rentalConvs: defaultRentalRevenues.map((item, i) => labeled[`rental:${item.label}`]?.months || fallback.rentalConvs[i] || Array(MONTHS).fill(0)),
    saleConvs: defaultSaleRevenues.map((item, i) => labeled[`sale:${item.label}`]?.months || fallback.saleConvs[i] || Array(MONTHS).fill(0)),
    mediaConvs: defaultMediaRevenues.map((item, i) => labeled[`media:${item.label}`]?.months || fallback.mediaConvs[i] || Array(MONTHS).fill(0)),
    expenses: defaultExpenses.map((item, i) => labeled[`exp:${item.label}`]?.months || fallback.expenses[i] || Array(MONTHS).fill(0)),
  };
}

export default function InvestmentView() {
  const {
    investment,
    commissionRate,
    activeBrands,
    activeMarkets,
    saleRevenues,
    rentalRevenues,
    mediaRevenues,
    expenseItems,
    activeScenario,
  } = useFinancial();

  const isMarketActive = useCallback((label: string) => {
    const key = label.toLowerCase() as keyof typeof activeMarkets;
    return activeMarkets[key] !== false;
  }, [activeMarkets]);

  const tableMonths = [1, 2, 3, 4, 5, 6];
  const [salariesExpanded, setSalariesExpanded] = useState(false);

  // Find index where collapsible salaries start
  const collapseFromIdx = expenseItems.findIndex(e => e.label === COLLAPSE_FROM_LABEL);

  // Default sim for realistic (derived from context revenues)
  const defaultSim = useMemo(() => ({
    rentalConvs: rentalRevenues.map(item => Array(MONTHS).fill(item.y1.conv)),
    saleConvs: saleRevenues.map(item => Array(MONTHS).fill(item.y1.conv)),
    mediaConvs: mediaRevenues.map(item => Array(MONTHS).fill(item.y1.conv)),
    expenses: expenseItems.map(item => Array(MONTHS).fill(item.y1)),
  }), [rentalRevenues, saleRevenues, mediaRevenues, expenseItems]);

  // Active sim state (for the currently displayed scenario)
  const [sim, setSim] = useState<SimData>(defaultSim);

  // In-memory store for ALL 3 scenarios — switching reads from here (instant, no async)
  const storeRef = useRef<ScenariosStore | null>(null);
  const simMounted = useRef(false);
  const simScenarioRef = useRef(activeScenario);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced save of the entire store to Supabase
  const saveStore = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (storeRef.current) saveToSupabase(SUPABASE_KEY, storeRef.current);
    }, 500);
  }, []);

  // Load all scenarios from Supabase once on mount
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    ensureMigrated().then(async () => {
      let store = await loadFromSupabase<ScenariosStore | null>(SUPABASE_KEY, null);

      if (!store) {
        // Migrate from old per-scenario keys (one-time)
        const legacyRealistic = await loadFromSupabase<LabeledSimData | null>('simdata_realistic', null)
          || await loadFromSupabase<LabeledSimData | null>('simdata', null);

        store = {
          realistic: legacyRealistic && Object.keys(legacyRealistic).length > 0
            ? legacyRealistic
            : simToLabeled(defaultSim),
          pessimistic: simToLabeled(ZEROED_SIM),
          optimistic: simToLabeled(ZEROED_SIM),
        };
        // Save migrated store immediately
        saveToSupabase(SUPABASE_KEY, store);
      }

      storeRef.current = store;
      const fallback = activeScenario === 'realistic' ? defaultSim : ZEROED_SIM;
      setSim(labeledToSim(store[activeScenario], fallback));
      simScenarioRef.current = activeScenario;
      simMounted.current = true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scenario switch — instant, in-memory only
  useEffect(() => {
    if (!simMounted.current || !storeRef.current) return;
    if (simScenarioRef.current === activeScenario) return;

    // Save current scenario's sim to the store
    storeRef.current[simScenarioRef.current] = simToLabeled(sim);

    // Load new scenario from the store
    const fallback = activeScenario === 'realistic' ? defaultSim : ZEROED_SIM;
    setSim(labeledToSim(storeRef.current[activeScenario], fallback));
    simScenarioRef.current = activeScenario;

    // Persist the whole store
    saveStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenario]);

  // Persist on sim edits (debounced)
  useEffect(() => {
    if (!simMounted.current || !storeRef.current) return;
    storeRef.current[simScenarioRef.current] = simToLabeled(sim);
    saveStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim]);

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

      const commByBrand = {
        feelHome: revByBrand.feelHome * commissionRate,
        mInvest: revByBrand.mInvest * commissionRate,
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
  }, [sim, activeBrands, activeMarkets, rentalRevenues, saleRevenues, mediaRevenues, expenseItems, investment, commissionRate, isMarketActive]);

  return (
    <div className="space-y-8 animate-fadeIn">
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
                  <tr key={`rental-${idx}`} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:!bg-white/[0.04]' : 'opacity-20'}`}>
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
                  <tr key={`sale-${idx}`} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:!bg-white/[0.04]' : 'opacity-20'}`}>
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
                <tr key={`media-${idx}`} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors">
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
              <tr key={`exp-${idx}`} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors">
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
              <tr key={`exp-${idx}`} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors">
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
              <tr key={`exp-${idx}`} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors">
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
        <SimCard title={`Commissions (${Math.round(commissionRate * 100)}%)`} tableMonths={tableMonths}>
          {activeBrands.feelHome && (
            <CashFlowRow label="Feel Home" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.commByBrand.feelHome} color="#d4875a" />
          )}
          {activeBrands.mInvest && (
            <CashFlowRow label="M Invest" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.commByBrand.mInvest} color="#5b8ec9" />
          )}

          <CashFlowRow label="Total Commissions" months={tableMonths} snapshots={localSnapshots} getValue={(s) => s.commissions} color="#f59e0b" bold />
        </SimCard>

        {/* BOTTOM LINE CARD */}
        <BottomLineCard tableMonths={tableMonths} snapshots={localSnapshots} />
      </div>
    </div>
  );
}

function SimCard({ title, tableMonths, children }: { title: string; tableMonths: number[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-[12px] table-fixed">
        <colgroup>
          <col className="w-[180px]" />
          {tableMonths.map((m) => (
            <col key={m} style={{ width: `${(100 - 20) / tableMonths.length}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            <th className="px-5 py-3 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider">{title}</th>
            {tableMonths.map((m) => (
              <th key={m} className="px-3 py-3 text-[10px] font-semibold text-white/40 text-center uppercase tracking-wider">
                Month {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="zebra-rows">{children}</tbody>
      </table>
    </div>
  );
}

function BottomLineCard({ tableMonths, snapshots }: { tableMonths: number[]; snapshots: MonthlySnapshot[] }) {
  const prevRef = useRef<string>('');
  const [flashKey, setFlashKey] = useState(0);

  const signature = snapshots.map(s => `${s.revenue}|${s.commissions}|${s.expenses}|${s.profit}|${s.cumulative}|${s.balance}`).join(',');

  useEffect(() => {
    if (prevRef.current && prevRef.current !== signature) {
      setFlashKey(k => k + 1);
    }
    prevRef.current = signature;
  }, [signature]);

  return (
    <SimCard title="Bottom Line" tableMonths={tableMonths}>
      <CashFlowRow label="Total Revenues" months={tableMonths} snapshots={snapshots} getValue={(s) => s.revenue} color="#2dd4bf" bold flashKey={flashKey} />
      <CashFlowRow label="Total Commissions (Team)" months={tableMonths} snapshots={snapshots} getValue={(s) => s.commissions} color="#f59e0b" bold flashKey={flashKey} />
      <CashFlowRow label="Total Expenses" months={tableMonths} snapshots={snapshots} getValue={(s) => s.expenses} color="#f43f5e" bold flashKey={flashKey} />
      <CashFlowRow label="Net Profit" months={tableMonths} snapshots={snapshots} getValue={(s) => s.profit} autoColor bold flashKey={flashKey} />
      <CashFlowRow label="Cumulative P&L" months={tableMonths} snapshots={snapshots} getValue={(s) => s.cumulative} autoColor bold flashKey={flashKey} />
      <CashFlowRow label="Cash Balance" months={tableMonths} snapshots={snapshots} getValue={(s) => s.balance} autoColor bold highlight flashKey={flashKey} />
    </SimCard>
  );
}

function CashFlowRow({
  label, months, snapshots, getValue, color, autoColor, bold, highlight, flashKey,
}: {
  label: string;
  months: number[];
  snapshots: MonthlySnapshot[];
  getValue: (s: MonthlySnapshot) => number;
  color?: string;
  autoColor?: boolean;
  bold?: boolean;
  highlight?: boolean;
  flashKey?: number;
}) {
  return (
    <tr className={`border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors ${highlight ? '!bg-white/[0.04]' : ''}`}>
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
            key={flashKey ? `${m}-${flashKey}` : m}
            className={`px-3 py-2.5 text-center font-mono ${bold ? 'font-bold text-[12px]' : 'text-[11px]'} ${flashKey ? 'flash-cell' : ''}`}
            style={{ color: cellColor }}
          >
            {val === 0 ? '—' : formatNumber(Math.round(val))}
          </td>
        );
      })}
    </tr>
  );
}
