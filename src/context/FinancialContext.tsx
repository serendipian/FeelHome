'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BrandKey, ExpenseItem, YearlyFinancials, MonthlySnapshot, SaleRevenueItem, RentalRevenueItem, MediaRevenueItem } from '@/types';
import { defaultSaleRevenues, defaultRentalRevenues, defaultMediaRevenues } from '@/data/revenues';
import { defaultExpenses } from '@/data/expenses';
import {
  calcYearlyFinancials,
  calcMonthlyFinancials,
  calcRevenueByBrand,
  calcExpensesByCategory,
  calcInvestmentSimulation,
  recalcSaleItem,
  recalcRentalItem,
  recalcMediaItem,
} from '@/lib/calculations';
import { loadFromSupabase, saveToSupabase, ensureMigrated } from '@/lib/supabase';

export type MarketKey = 'casablanca' | 'rabat' | 'marrakech' | 'autre';
export type ScenarioKey = 'pessimistic' | 'realistic' | 'optimistic';

interface FinancialState {
  activeBrands: Record<BrandKey, boolean>;
  toggleBrand: (brand: BrandKey) => void;
  activeMarkets: Record<MarketKey, boolean>;
  toggleMarket: (market: MarketKey) => void;
  yearly: [YearlyFinancials, YearlyFinancials, YearlyFinancials];
  monthly: ReturnType<typeof calcMonthlyFinancials>;
  revenueByBrand: { y1: Record<BrandKey, number>; y2: Record<BrandKey, number>; y3: Record<BrandKey, number> };
  expensesByCategory: { y1: Record<string, number>; y2: Record<string, number>; y3: Record<string, number> };
  // Revenue data (editable)
  saleRevenues: SaleRevenueItem[];
  rentalRevenues: RentalRevenueItem[];
  mediaRevenues: MediaRevenueItem[];
  updateSaleItem: (index: number, field: string, value: number) => void;
  updateRentalItem: (index: number, field: string, value: number) => void;
  updateMediaItem: (index: number, field: string, value: number) => void;
  // Expense data (editable)
  expenseItems: ExpenseItem[];
  updateExpenseItem: (index: number, field: string, value: number) => void;
  // Investment simulation
  investment: number;
  setInvestment: (v: number) => void;
  commissionRate: number;
  setCommissionRate: (v: number) => void;
  simulation: {
    snapshots: MonthlySnapshot[];
    breakEvenMonth: number;
    roi: number;
    finalCash: number;
  };
  // Scenarios
  activeScenario: ScenarioKey;
  setActiveScenario: (s: ScenarioKey) => void;
}

const FinancialContext = createContext<FinancialState | null>(null);

// Reorder loaded array to match the code-defined default order (by label).
function reorderByLabel<T extends { label: string }>(loaded: T[], defaults: T[]): T[] {
  const byLabel = new Map(loaded.map(item => [item.label, item]));
  return defaults.map(d => byLabel.get(d.label) ?? d);
}

// Zero-conversion defaults for new scenarios
function zeroConvSales(): SaleRevenueItem[] {
  return defaultSaleRevenues.map(item => recalcSaleItem({
    ...item, y1: { ...item.y1, conv: 0 }, y2: { ...item.y2, conv: 0 }, y3: { ...item.y3, conv: 0 },
  }));
}
function zeroConvRentals(): RentalRevenueItem[] {
  return defaultRentalRevenues.map(item => recalcRentalItem({
    ...item, y1: { ...item.y1, conv: 0 }, y2: { ...item.y2, conv: 0 }, y3: { ...item.y3, conv: 0 },
  }));
}
function zeroConvMedia(): MediaRevenueItem[] {
  return defaultMediaRevenues.map(item => recalcMediaItem({
    ...item, y1: { ...item.y1, conv: 0 }, y2: { ...item.y2, conv: 0 }, y3: { ...item.y3, conv: 0 },
  }));
}

// Debounced save to Supabase (500ms delay to batch rapid edits)
const supabaseTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSave(key: string, value: unknown) {
  clearTimeout(supabaseTimers[key]);
  supabaseTimers[key] = setTimeout(() => { saveToSupabase(key, value); }, 500);
}

// Load scenario data with fallback: try prefixed key, then legacy unprefixed (for realistic only)
async function loadScenarioValue<T>(key: string, scenario: ScenarioKey, fallback: T): Promise<T> {
  const prefixed = await loadFromSupabase<T | null>(`${key}_${scenario}`, null);
  if (prefixed !== null) return prefixed;
  // For realistic, fall back to legacy unprefixed key (migration path)
  if (scenario === 'realistic') {
    return loadFromSupabase<T>(key, fallback);
  }
  return fallback;
}

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [activeBrands, setActiveBrands] = useState<Record<BrandKey, boolean>>(
    { feelHome: true, mInvest: true, expats: true }
  );

  const [saleRevenues, setSaleRevenues] = useState<SaleRevenueItem[]>(defaultSaleRevenues);
  const [rentalRevenues, setRentalRevenues] = useState<RentalRevenueItem[]>(defaultRentalRevenues);
  const [mediaRevenues, setMediaRevenues] = useState<MediaRevenueItem[]>(defaultMediaRevenues);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(defaultExpenses);

  const [activeMarkets, setActiveMarkets] = useState<Record<MarketKey, boolean>>(
    { casablanca: true, rabat: true, marrakech: true, autre: true }
  );

  const toggleMarket = (market: MarketKey) => {
    setActiveMarkets((prev) => ({ ...prev, [market]: !prev[market] }));
  };

  const [investment, setInvestment] = useState(500000);
  const [commissionRate, setCommissionRate] = useState(0.25);
  const [activeScenario, setActiveScenarioRaw] = useState<ScenarioKey>('realistic');

  // Track current scenario in a ref so save effects always use the latest value
  const scenarioRef = useRef<ScenarioKey>('realistic');

  // Load from Supabase on mount, then enable persistence
  const readyToSave = useRef(false);
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    (async () => {
      await ensureMigrated();
      // Load scenario first
      const scenario = await loadFromSupabase<ScenarioKey>('activeScenario', 'realistic');
      scenarioRef.current = scenario;
      setActiveScenarioRaw(scenario);

      const [ab, am, sr, rr, mr, ei, inv, cr] = await Promise.all([
        loadFromSupabase<Record<BrandKey, boolean>>('activeBrands', activeBrands),
        loadFromSupabase<Record<MarketKey, boolean>>('activeMarkets', activeMarkets),
        loadScenarioValue<SaleRevenueItem[]>('saleRevenues', scenario, defaultSaleRevenues),
        loadScenarioValue<RentalRevenueItem[]>('rentalRevenues', scenario, defaultRentalRevenues),
        loadScenarioValue<MediaRevenueItem[]>('mediaRevenues', scenario, defaultMediaRevenues),
        loadScenarioValue<ExpenseItem[]>('expenseItems', scenario, defaultExpenses),
        loadFromSupabase<number>('investment', investment),
        loadFromSupabase<number>('commissionRate', commissionRate),
      ]);
      setActiveBrands(ab);
      setActiveMarkets(am);
      setSaleRevenues(reorderByLabel(sr, defaultSaleRevenues));
      setRentalRevenues(reorderByLabel(rr, defaultRentalRevenues));
      setMediaRevenues(reorderByLabel(mr, defaultMediaRevenues));
      setExpenseItems(reorderByLabel(ei, defaultExpenses));
      setInvestment(inv);
      setCommissionRate(cr);
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to Supabase (debounced) — scenario-aware for revenue/expense data
  useEffect(() => { if (readyToSave.current) debouncedSave('activeBrands', activeBrands); }, [activeBrands]);
  useEffect(() => { if (readyToSave.current) debouncedSave('activeMarkets', activeMarkets); }, [activeMarkets]);
  useEffect(() => { if (readyToSave.current) debouncedSave(`saleRevenues_${scenarioRef.current}`, saleRevenues); }, [saleRevenues]);
  useEffect(() => { if (readyToSave.current) debouncedSave(`rentalRevenues_${scenarioRef.current}`, rentalRevenues); }, [rentalRevenues]);
  useEffect(() => { if (readyToSave.current) debouncedSave(`mediaRevenues_${scenarioRef.current}`, mediaRevenues); }, [mediaRevenues]);
  useEffect(() => { if (readyToSave.current) debouncedSave(`expenseItems_${scenarioRef.current}`, expenseItems); }, [expenseItems]);
  useEffect(() => { if (readyToSave.current) debouncedSave('investment', investment); }, [investment]);
  useEffect(() => { if (readyToSave.current) debouncedSave('commissionRate', commissionRate); }, [commissionRate]);

  // Scenario switch handler
  const setActiveScenario = useCallback(async (newScenario: ScenarioKey) => {
    if (newScenario === scenarioRef.current) return;
    const prevScenario = scenarioRef.current;
    readyToSave.current = false;

    // Save current data to current scenario keys (immediate, not debounced)
    await Promise.all([
      saveToSupabase(`saleRevenues_${prevScenario}`, saleRevenues),
      saveToSupabase(`rentalRevenues_${prevScenario}`, rentalRevenues),
      saveToSupabase(`mediaRevenues_${prevScenario}`, mediaRevenues),
      saveToSupabase(`expenseItems_${prevScenario}`, expenseItems),
    ]);

    // Switch scenario
    scenarioRef.current = newScenario;
    setActiveScenarioRaw(newScenario);
    saveToSupabase('activeScenario', newScenario);

    // Load new scenario data (zeroed defaults for pessimistic/optimistic if no saved data)
    const zeroSales = zeroConvSales();
    const zeroRentals = zeroConvRentals();
    const zeroMedia = zeroConvMedia();

    const fallbackSales = newScenario === 'realistic' ? defaultSaleRevenues : zeroSales;
    const fallbackRentals = newScenario === 'realistic' ? defaultRentalRevenues : zeroRentals;
    const fallbackMedia = newScenario === 'realistic' ? defaultMediaRevenues : zeroMedia;

    const [sr, rr, mr, ei] = await Promise.all([
      loadScenarioValue<SaleRevenueItem[]>('saleRevenues', newScenario, fallbackSales),
      loadScenarioValue<RentalRevenueItem[]>('rentalRevenues', newScenario, fallbackRentals),
      loadScenarioValue<MediaRevenueItem[]>('mediaRevenues', newScenario, fallbackMedia),
      loadScenarioValue<ExpenseItem[]>('expenseItems', newScenario, defaultExpenses),
    ]);

    setSaleRevenues(reorderByLabel(sr, defaultSaleRevenues));
    setRentalRevenues(reorderByLabel(rr, defaultRentalRevenues));
    setMediaRevenues(reorderByLabel(mr, defaultMediaRevenues));
    setExpenseItems(reorderByLabel(ei, defaultExpenses));

    setTimeout(() => { readyToSave.current = true; }, 0);
  }, [saleRevenues, rentalRevenues, mediaRevenues, expenseItems]);

  const toggleBrand = (brand: BrandKey) => {
    setActiveBrands((prev) => ({ ...prev, [brand]: !prev[brand] }));
  };

  const updateSaleItem = useCallback((index: number, field: string, value: number) => {
    setSaleRevenues((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'priceM2') item.priceM2 = value;
      else if (field === 'area') item.area = value;
      else if (field === 'commRate') item.commRate = value;
      else if (field === 'y1.conv') item.y1 = { ...item.y1, conv: value };
      else if (field === 'y2.conv') item.y2 = { ...item.y2, conv: value };
      else if (field === 'y3.conv') item.y3 = { ...item.y3, conv: value };
      updated[index] = recalcSaleItem(item);
      return updated;
    });
  }, []);

  const updateRentalItem = useCallback((index: number, field: string, value: number) => {
    setRentalRevenues((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'rent') item.rent = value;
      else if (field === 'commFactor') item.commFactor = value;
      else if (field === 'y1.conv') item.y1 = { ...item.y1, conv: value };
      else if (field === 'y2.conv') item.y2 = { ...item.y2, conv: value };
      else if (field === 'y3.conv') item.y3 = { ...item.y3, conv: value };
      updated[index] = recalcRentalItem(item);
      return updated;
    });
  }, []);

  const updateMediaItem = useCallback((index: number, field: string, value: number) => {
    setMediaRevenues((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'unitPrice') item.unitPrice = value;
      else if (field === 'y1.conv') item.y1 = { ...item.y1, conv: value };
      else if (field === 'y2.conv') item.y2 = { ...item.y2, conv: value };
      else if (field === 'y3.conv') item.y3 = { ...item.y3, conv: value };
      updated[index] = recalcMediaItem(item);
      return updated;
    });
  }, []);

  const updateExpenseItem = useCallback((index: number, field: string, value: number) => {
    setExpenseItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'y1') item.y1 = value;
      else if (field === 'y2') item.y2 = value;
      else if (field === 'y3') item.y3 = value;
      else if (field === 'variableCost') item.variableCost = value;
      updated[index] = item;
      return updated;
    });
  }, []);

  const yearly = useMemo(
    () =>
      (['y1', 'y2', 'y3'] as const).map((y) =>
        calcYearlyFinancials(activeBrands, y, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, activeMarkets, commissionRate)
      ) as [YearlyFinancials, YearlyFinancials, YearlyFinancials],
    [activeBrands, activeMarkets, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, commissionRate]
  );

  const monthly = useMemo(
    () => calcMonthlyFinancials(activeBrands, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, activeMarkets, commissionRate),
    [activeBrands, activeMarkets, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, commissionRate]
  );

  const revenueByBrand = useMemo(
    () => ({
      y1: calcRevenueByBrand(activeBrands, 'y1', saleRevenues, rentalRevenues, mediaRevenues, activeMarkets),
      y2: calcRevenueByBrand(activeBrands, 'y2', saleRevenues, rentalRevenues, mediaRevenues, activeMarkets),
      y3: calcRevenueByBrand(activeBrands, 'y3', saleRevenues, rentalRevenues, mediaRevenues, activeMarkets),
    }),
    [activeBrands, activeMarkets, saleRevenues, rentalRevenues, mediaRevenues]
  );

  const expensesByCategory = useMemo(
    () => ({
      y1: calcExpensesByCategory(activeBrands, 'y1', expenseItems),
      y2: calcExpensesByCategory(activeBrands, 'y2', expenseItems),
      y3: calcExpensesByCategory(activeBrands, 'y3', expenseItems),
    }),
    [activeBrands, expenseItems]
  );

  const simulation = useMemo(
    () => calcInvestmentSimulation(activeBrands, investment, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, activeMarkets, commissionRate),
    [activeBrands, activeMarkets, investment, commissionRate, saleRevenues, rentalRevenues, mediaRevenues, expenseItems]
  );

  return (
    <FinancialContext.Provider
      value={{
        activeBrands,
        toggleBrand,
        activeMarkets,
        toggleMarket,
        yearly,
        monthly,
        revenueByBrand,
        expensesByCategory,
        saleRevenues,
        rentalRevenues,
        mediaRevenues,
        updateSaleItem,
        updateRentalItem,
        updateMediaItem,
        expenseItems,
        updateExpenseItem,
        investment,
        setInvestment,
        commissionRate,
        setCommissionRate,
        simulation,
        activeScenario,
        setActiveScenario,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
